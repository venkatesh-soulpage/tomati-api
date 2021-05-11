import models from "../models";

import _ from "lodash";
import moment from "moment";
import latinize from "latinize";
import getPage from "../utils/restaurantRedirection";

var requestIp = require("request-ip");

const QRCode = require("qrcode");
const isBase64 = require("is-base64");
const { s3 } = require("../utils/s3Config");
const sharp = require("sharp");
var chargebee = require("chargebee");
chargebee.configure({
  site: `${process.env.CHARGEBEE_SITE}`,
  api_key: `${process.env.CHARGEBEE_API_KEY}`,
});

const getVenues = async (req, res, next) => {
  try {
    // Get brief
    const venues = await models.OutletVenue.query()
      .withGraphFetched(`[menu]`)
      .orderBy("created_at", "desc");

    // Send the clientss
    return res.status(200).send(venues);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getUserVenues = async (req, res, next) => {
  try {
    const { account_id } = req;
    const user = await models.Account.query().findById(account_id);
    if (user.is_admin) {
      if (!req.body.account_id)
        return res.status(400).json("Admin has no access to create menus");
      const venues = await models.OutletVenue.query()
        .orderBy("created_at", "desc")
        .where("account_id", req.body.account_id);
      return res.status(200).send(venues);
    }
    // Get brief
    const venues = await models.OutletVenue.query()
      .orderBy("created_at", "desc")
      .where("account_id", account_id);
    return res.status(200).send(venues);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

// GET - Get an specific event with an id
const getVenue = async (req, res, next) => {
  try {
    const { outlet_venue_id } = req.params;
    const clientIp = requestIp.getClientIp(req);
    const ipAddress = clientIp.split("::ffff:").slice(-1).pop();
    const countObject = { ip: ipAddress, time: +new Date() };

    if (!outlet_venue_id) return res.status(400).json("Invalid ID");

    let venue = await models.OutletVenue.query().findById(outlet_venue_id);
    if (venue === undefined) return res.status(400).json("invalid");
    const account = await models.Account.query().findById(venue.account_id);

    const { subscription } = await chargebee.subscription
      .retrieve(account.transaction_id)
      .request();
    const freeMenu = await subscription.addons.find(
      (item) => item.id === "free-menu"
    );
    const managerActiveMenus = await models.OutletVenue.query().where({
      is_venue_active: true,
      account_id: account.id,
    });

    if (
      !["active", "in_trial"].includes(subscription.status) &&
      venue.is_venue_active
    ) {
      await models.OutletVenue.query()
        .update({ is_venue_active: false })
        .findById(outlet_venue_id);
    } else if (
      ["active", "in_trial"].includes(subscription.status) &&
      managerActiveMenus.length < freeMenu.quantity &&
      !venue.is_venue_active
    ) {
      await models.OutletVenue.query()
        .update({ is_venue_active: true })
        .findById(outlet_venue_id);
    } else if (
      ["active", "in_trial"].includes(subscription.status) &&
      managerActiveMenus.length > freeMenu.quantity &&
      venue.is_venue_active
    ) {
      await models.OutletVenue.query()
        .update({ is_venue_active: false })
        .findById(outlet_venue_id);
    }

    venue = await models.OutletVenue.query()
      .withGraphFetched(`[menu,collaborators,location]`)
      .findById(outlet_venue_id);

    if (req.headers["qr_scan"] || req.headers["accept-language"]) {
      const { stats } = venue;
      if (stats && stats.data && stats.data.length > 0) {
        const { data } = stats;
        data.push(countObject);
        await models.OutletVenue.query()
          .update({ stats: { data } })
          .findById(outlet_venue_id);
      } else {
        await models.OutletVenue.query()
          .update({ stats: { data: [countObject] } })
          .findById(outlet_venue_id);
      }
    }
    return res.status(200).json(venue);
  } catch (error) {
    console.log(error);
    return res.status(500).json(JSON.stringify(error));
  }
};

const uploadImage = async (file_data) => {
  const { key, buf } = file_data;

  var data = {
    Key: key,
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/png",
  };
  await s3.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log("Error uploading data: ", data);
    } else {
      console.log("successfully uploaded the image!", data);
    }
  });
};

const uploadHtmlPage = async (file_data) => {
  const { key, htmlData } = file_data;

  var data = {
    Key: key,
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Body: htmlData,
    CacheControl: "max-age=0,no-cache,no-store,must-revalidate",
    ContentType: "text/html",
    ACL: "public-read",
  };
  await s3.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log("Error uploading data: ", data);
    } else {
      console.log("successfully uploaded the Page!", data);
    }
  });
};
const createVenue = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    const {
      name,
      phone_number,
      address,
      latitude,
      longitude,
      location_id,
      description,
    } = req.body;
    const venue = await models.OutletVenue.query().findOne("name", name);
    if (venue)
      return res
        .status(400)
        .json(
          "Venue with this name already exists. Please try with another name"
        );
    let buf, cover_image;
    let logobuf, logo_image;
    const account = await models.Account.query()
      .withGraphFetched(`[plan]`)
      .where("id", account_id);
    const venues_of_account_holder = await models.OutletVenue.query().where(
      "account_id",
      account_id
    );
    if (req.files) {
      cover_image = req.files.cover_image;
      buf = cover_image.data;
      logo_image = req.files.logo_img;
      logobuf = logo_image.data;
    } else if (req.body.cover_image) {
      cover_image = req.body.cover_image;
      logo_image = req.body.logo_img;
      buf = Buffer.from(
        cover_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      logobuf = Buffer.from(
        logo_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }
    const key = `public/cover_images/outletvenues/${cover_image.name}`;
    const largeCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-large`;
    const mediumCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-medium`;
    const smallCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-small`;
    const largeResizedImage = await sharp(buf).resize(1200, 800).toBuffer();
    const mediumResizedImage = await sharp(buf).resize(600, 400).toBuffer();
    const smallResizedImage = await sharp(buf).resize(300, 200).toBuffer();
    const key2 = `public/cover_images/outletvenues/${logo_image.name}`;

    uploadImage({ key, buf });
    uploadImage({ key: key2, buf: logobuf });
    uploadImage({ key: largeCoverImageKey, buf: largeResizedImage });
    uploadImage({ key: mediumCoverImageKey, buf: mediumResizedImage });
    uploadImage({ key: smallCoverImageKey, buf: smallResizedImage });

    const new_venue = await models.OutletVenue.query().insert({
      name,
      phone_number,
      address,
      latitude,
      longitude,
      account_id,
      location_id,
      description,
      cover_image: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
      logo_img: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key2}`,
    });
    const site = `${process.env.SCHEMA}://${process.env.APP_HOST}${
      process.env.APP_PORT && `:${process.env.APP_PORT}`
    }`;
    let htmlData = getPage(process.env.SCHEMA, site, new_venue.id);
    let formattedName = latinize(new_venue.name);
    formattedName = formattedName.toLowerCase().trim().replace(/\s+/g, "");
    const HtmlKey = `${formattedName}/index.html`;
    uploadHtmlPage({ key: HtmlKey, htmlData });
    // Send the clients
    return res.status(201).json({
      Status: true,
      Venue: new_venue,
      Message: "Venue Created Successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateVenue = async (req, res, next) => {
  try {
    const { account_id, scope } = req;

    const { outlet_venue_id } = req.params;

    const outletvenue = await models.OutletVenue.query().findById(
      outlet_venue_id
    );

    if (!outlet_venue_id || !outletvenue)
      return res.status(400).json("Invalid ID");

    // if (_.size(req.body) < 1) return res.status(400).json("No Data to update");

    const {
      name,
      phone_number,
      description,
      address,
      location_id,
      latitude,
      longitude,
    } = req.body;

    let buf, cover_image;
    let logobuf, logo_image;
    if (req.files) {
      cover_image = req.files.cover_image;
      buf = cover_image.data;
      logo_image = req.files.logo_img;
      logobuf = logo_image.data;
    } else if (req.body.logo_img) {
      logo_image = req.body.logo_img;
      logobuf = Buffer.from(
        logo_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    } else if (req.body.cover_image) {
      cover_image = req.body.cover_image;
      buf = Buffer.from(
        cover_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }
    if (logobuf && logo_image) {
      const key = `public/cover_images/outletvenues/${logo_image.name}`;
      uploadImage({ key, buf: logobuf });
      await models.OutletVenue.query()
        .update({
          logo_img: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
        })
        .where("id", outlet_venue_id);
    }
    if (buf && cover_image) {
      const key = `public/cover_images/outletvenues/${cover_image.name}`;
      const largeCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-large`;
      const mediumCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-medium`;
      const smallCoverImageKey = `public/cover_images/outletvenues/${cover_image.name}-small`;
      const largeResizedImage = await sharp(buf).resize(1200, 800).toBuffer();
      const mediumResizedImage = await sharp(buf).resize(600, 400).toBuffer();
      const smallResizedImage = await sharp(buf).resize(300, 200).toBuffer();
      uploadImage({ key, buf });
      uploadImage({ key: largeCoverImageKey, buf: largeResizedImage });
      uploadImage({ key: mediumCoverImageKey, buf: mediumResizedImage });
      uploadImage({ key: smallCoverImageKey, buf: smallResizedImage });
      await models.OutletVenue.query()
        .update({
          cover_image: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
        })
        .where("id", outlet_venue_id);
    }
    await models.OutletVenue.query()
      .update({
        name,
        phone_number,
        description,
        address,
        location_id,
        latitude,
        longitude,
        // account_id,
      })
      .where("id", outlet_venue_id);
    return res.status(200).json("Venue Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteVenue = async (req, res, next) => {
  try {
    const { outlet_venue_id } = req.params;

    const outletvenue = await models.OutletVenue.query().findById(
      outlet_venue_id
    );

    if (!outlet_venue_id || !outletvenue)
      return res.status(400).json("Invalid ID");

    await models.OutletVenueMenu.query()
      .where("outlet_venue_id", outlet_venue_id)
      .delete();

    await models.OutletVenue.query().deleteById(outlet_venue_id);

    return res.status(200).json("Succesfully Deleted");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const generateQRCode = async (outlet_venue_id) => {
  const key = `public/qr_codes/outletvenues/${outlet_venue_id}.png`;

  let APP_HOST = `${process.env.SCHEMA}://${process.env.APP_HOST}`;

  if (process.env.APP_PORT) {
    APP_HOST += ":" + process.env.APP_PORT;
  }

  const APP_URL = APP_HOST + `/outlet/?outlet_venue=${outlet_venue_id}`;
  const url = await QRCode.toDataURL(`URL: ${APP_URL}`, { width: 1000 });
  const buf = Buffer.from(
    url.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  uploadImage({ key, buf });

  await models.OutletVenue.query()
    .update({
      menu_link: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
    })
    .where({ id: outlet_venue_id });
};

const createVenueMenu = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    const { outlet_venue_id } = req.params;

    for (let item of req.body) {
      item.outlet_venue_id = outlet_venue_id;
    }

    const menu = await models.OutletVenueMenu.query().where({
      outlet_venue_id,
    });

    if (menu.length > 0)
      await models.OutletVenueMenu.query().delete().where({ outlet_venue_id });
    else {
      generateQRCode(outlet_venue_id);
    }

    const new_venue = await models.OutletVenueMenu.query().insertGraph(
      req.body
    );

    // Send the clients
    return res.status(201).json("VenueMenu Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const inactivateMenu = async (req, res, next) => {
  try {
    const { account_id } = req;
    const { venue_id } = req.params;
    const { status } = req.body;
    const user = await models.Account.query().findById(account_id);
    if (!user)
      return res.status(400).json("No user active with this account Id");
    //TODO admin can change active-inavtive state funtionality needed
    if (user.is_admin) {
      const venue = await models.OutletVenue.query().findById(venue_id);
      const activeVenues = await models.OutletVenue.query().where({
        account_id: venue.account_id,
        is_venue_active: true,
      });
      const manager = await models.Account.query().findById(venue.account_id);
      const subscriptionDetails = await chargebee.subscription
        .retrieve(manager.transaction_id)
        .request();
      const menuAddon = subscriptionDetails.subscription.addons.find(
        (addon) => addon.id === "free-menu"
      );
      if (status && activeVenues.length >= menuAddon.quantity) {
        return res.status(400).json({
          status: false,
          message: "Cannot actiavate more venues than subscription limit",
        });
      }
      await models.OutletVenue.query()
        .update({
          is_venue_active: status,
        })
        .findById(venue_id);
      return res.status(200).send(`updated successfully`);
    }
    //TODO restrict the number of times user can change status to menuAddon.quantity
    const subscriptionDetails = await chargebee.subscription
      .retrieve(user.transaction_id)
      .request();
    const menuAddon = subscriptionDetails.subscription.addons.find(
      (addon) => addon.id === "free-menu"
    );
    const venues = await models.OutletVenue.query()
      .orderBy("created_at", "asc")
      .where({ account_id });
    const activeMenus = _.filter(venues, ["is_venue_active", true]);
    if (status && menuAddon.quantity <= activeMenus.length) {
      return res.status(400).json({
        status: false,
        message: "Please upgrade your plan or contact",
      });
    }
    const monthlyStatusCount = await models.MenuStatusCount.query()
      .where("created_at", ">=", new moment().startOf("month"))
      .where("created_at", "<", new moment().endOf("month"))
      .where({ account_id });
    if (menuAddon.quantity <= monthlyStatusCount.length)
      return res.status(400).json({
        status: false,
        message: "You've exceeded your limit to activate menu",
      });
    await models.OutletVenue.query()
      .update({
        is_venue_active: status,
      })
      .where("id", venue_id);
    if (status) {
      await models.MenuStatusCount.query().insert({
        account_id,
      });
      return res.status(202).json({
        status: true,
        message: `You've only ${
          menuAddon.quantity - monthlyStatusCount.length - 1
        } remaining chances to switch your menus for this month`,
      });
    }
    return res.status(202).json({
      status: true,
      message: "Deactivated the requested menu",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateMenuStatusByPlan = async (req, res, next) => {
  try {
    // const { account_id } = req;
    let account_id = req.account_id;
    let user = await models.Account.query().findById(account_id);
    if (!user)
      return res.status(400).json("No user active with this account Id");
    if (user.is_admin) {
      account_id = req.body.account_id;
    }
    user = await models.Account.query().findById(account_id);
    const subscriptionDetails = await chargebee.subscription
      .retrieve(user.transaction_id)
      .request();
    const menuAddon = subscriptionDetails.subscription.addons.find(
      (addon) => addon.id === "free-menu"
    );
    const activeMenus = await models.OutletVenue.query()
      .orderBy("created_at", "desc")
      .where({ account_id, is_venue_active: true });
    const inactiveMenus = await models.OutletVenue.query()
      .orderBy("created_at", "desc")
      .where({ account_id, is_venue_active: false });
    const activeMenusIds = _.map(
      _.slice(activeMenus, 0, menuAddon.quantity),
      "id"
    );
    //cancellation
    if (
      !["active", "in_trial"].includes(subscriptionDetails.subscription.status)
    ) {
      await models.OutletVenue.query()
        .update({ is_venue_active: false })
        .where({ account_id, is_venue_active: true });
    }
    if (!user.previous_plan || !user.previous_status) {
      await models.Account.query()
        .update({
          previous_plan: subscriptionDetails.subscription.plan_id,
          previous_status: subscriptionDetails.subscription.status,
        })
        .findById(account_id);
      return res.status(200).json("RESPONSE SUCCESS");
    }
    user = await models.Account.query().findById(account_id);
    if (
      (user.previous_plan !== null &&
        subscriptionDetails.subscription.plan_id !== user.previous_plan) ||
      (user.previous_status !== null &&
        subscriptionDetails.subscription.status !== user.previous_status)
    ) {
      if (menuAddon.quantity < activeMenus.length) {
        await models.OutletVenue.query()
          .update({ is_venue_active: false })
          .where({ account_id, is_venue_active: true })
          .whereNotIn("id", activeMenusIds);
      } else {
        const inactiveMenusIds = _.map(
          _.slice(inactiveMenus, 0, menuAddon.quantity - activeMenus.length),
          "id"
        );
        await models.OutletVenue.query()
          .update({ is_venue_active: true })
          .where({ account_id, is_venue_active: false })
          .whereIn("id", inactiveMenusIds);
      }
      await models.Account.query()
        .update({ previous_plan: subscriptionDetails.subscription.plan_id })
        .findById(account_id);
      await models.Account.query()
        .update({ previous_status: subscriptionDetails.subscription.status })
        .findById(account_id);
    }

    return res.status(202).json("RESPONSE SUCCESS");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const venuesController = {
  getVenues,
  getUserVenues,
  getVenue,
  createVenue,
  createVenueMenu,
  updateVenue,
  deleteVenue,
  inactivateMenu,
  updateMenuStatusByPlan,
};

export default venuesController;
