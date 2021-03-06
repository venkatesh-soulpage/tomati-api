import models from "../models";

import _ from "lodash";

var requestIp = require("request-ip");

const QRCode = require("qrcode");
const isBase64 = require("is-base64");
const { s3 } = require("../utils/s3Config");
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
    const user = await models.Account.query().where("id", account_id).first();
    if (user.is_admin) {
      const venues = await models.OutletVenue.query()
        .withGraphFetched(`[menu]`)
        .orderBy("created_at", "desc")
        .where("account_id", req.body.account_id);
      return res.status(200).send(venues);
    }
    const subscriptionDetails = await chargebee.subscription
      .retrieve(user.transaction_id)
      .request();
    const menuAddon = subscriptionDetails.subscription.addons.find(
      (addon) => addon.id === "free-menu"
    );
    // Get brief
    const venues = await models.OutletVenue.query()
      .withGraphFetched(`[menu]`)
      .orderBy("created_at", "desc")
      .where("account_id", account_id);
    if (menuAddon.quantity < venues.length) {
      const difference = venues.length - menuAddon.quantity;
      const lastVenues = venues.slice(-difference);
      for (let venue of lastVenues) {
        await models.OutletVenue.query()
          .update({
            is_venue_active: false,
            is_qr_active: false,
          })
          .where({ id: venue.id });
      }
      // Send the clientss
      return res.status(200).send(venues);
    } else {
      for (let venue of venues) {
        await models.OutletVenue.query()
          .update({
            is_venue_active: true,
            is_qr_active: true,
          })
          .where({ id: venue.id });
      }
      // Send the clientss
      return res.status(200).send(venues);
    }
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

    const venue = await models.OutletVenue.query()
      .withGraphFetched(`[menu, location]`)
      // .findById(outlet_venue_id);
      .where({ id: outlet_venue_id, is_qr_active: true })
      .first();

    if (!venue) return res.status(400).json("Invalid or Inactive menu");

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

    let buf, cover_image;
    let logobuf, logo_image;
    const account = await models.Account.query()
      .withGraphFetched(`[plan]`)
      .where("id", account_id);
    const venues_of_account_holder = await models.OutletVenue.query().where(
      "account_id",
      account_id
    );
    // if (
    //   account[0].plan[0] !== undefined &&
    //   venues_of_account_holder.length >= account[0].no_of_outlets
    // ) {
    //   return res
    //     .status(400)
    //     .json(
    //       "Failed to create venue.Upgrade to Preminum to create more venues"
    //     );
    // }
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
    const key2 = `public/cover_images/outletvenues/${logo_image.name}`;

    uploadImage({ key, buf });
    uploadImage({ key: key2, buf: logobuf });

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
      uploadImage({ key, buf });
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
    const to_activate_id = req.params.venue_id;
    const venue = await models.OutletVenue.query()
      .orderBy("created_at", "asc")
      .where({ account_id, is_venue_active: true })
      .first();
    await models.OutletVenue.query()
      .update({
        is_venue_active: false,
        is_qr_active: false,
      })
      .where("id", venue.id);
    await models.OutletVenue.query()
      .update({
        is_venue_active: true,
        is_qr_active: true,
      })
      .where("id", to_activate_id);

    // console.log(account_id, venue_id);
    return res.status(201).json("Success");
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
};

export default venuesController;
