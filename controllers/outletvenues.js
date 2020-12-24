import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import { sendInviteCode } from "./mailling";
import AWS from "aws-sdk";

import _ from "lodash";

const QRCode = require("qrcode");
const isBase64 = require("is-base64");

// Inititialize AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: process.env.BUCKETEER_AWS_REGION,
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
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// GET - Get an specific event with an id
const getVenue = async (req, res, next) => {
  try {
    const { outlet_venue_id } = req.params;

    if (!outlet_venue_id) return res.status(400).json("Invalid ID").send();

    const venue = await models.OutletVenue.query()
      .withGraphFetched(`[menu, location]`)
      .findById(outlet_venue_id);

    return res.status(200).json(venue).send();
  } catch (error) {
    console.log(error);
    return res.status(500).json(JSON.stringify(error)).send();
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
      address,
      latitude,
      longitude,
      location_id,
      description,
    } = req.body;

    let buf, cover_image;

    if (req.files) {
      cover_image = req.files.cover_image;
      buf = cover_image.data;
    } else if (req.body.cover_image) {
      cover_image = req.body.cover_image;
      buf = Buffer.from(
        cover_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }

    const key = `public/cover_images/outletvenues/${cover_image.name}`;

    uploadImage({ key, buf });

    const new_venue = await models.OutletVenue.query().insert({
      name,
      address,
      latitude,
      longitude,
      account_id,
      location_id,
      description,
      cover_image: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
    });

    // Send the clients
    return res.status(201).json("Venue Created Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
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
      return res.status(400).json("Invalid ID").send();

    if (_.size(req.body) < 1)
      return res.status(400).json("No Data to update").send();

    const {
      name,
      description,
      address,
      location_id,
      latitude,
      longitude,
    } = req.body;

    let buf, cover_image;

    if (req.files) {
      cover_image = req.files.cover_image;
      buf = cover_image.data;
    } else if (req.body.cover_image) {
      cover_image = req.body.cover_image;
      if (isBase64(cover_image.data, { mimeRequired: true }))
        buf = Buffer.from(
          cover_image.data.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
    }
    if (buf && cover_image) {
      const key = `public/cover_images/outletvenues/${cover_image.name}`;
      uploadImage({ key, buf });
      await models.OutletVenue.query()
        .update({
          cover_image: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
        })
        .where("id", outlet_venue_id);
    }

    await models.OutletVenue.query()
      .update({
        name,
        description,
        address,
        location_id,
        latitude,
        longitude,
        account_id,
      })
      .where("id", outlet_venue_id);
    return res.status(200).json("Venue Updated Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const deleteVenue = async (req, res, next) => {
  try {
    const { outlet_venue_id } = req.params;

    const outletvenue = await models.OutletVenue.query().findById(
      outlet_venue_id
    );

    if (!outlet_venue_id || !outletvenue)
      return res.status(400).json("Invalid ID").send();

    await models.OutletVenueMenu.query()
      .where("outlet_venue_id", outlet_venue_id)
      .delete();

    await models.OutletVenue.query().deleteById(outlet_venue_id);

    return res.status(200).json("Succesfully Deleted");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
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
      menu_link: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
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
    return res.status(201).json("VenueMenu Created Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const venuesController = {
  getVenues,
  getVenue,
  createVenue,
  createVenueMenu,
  updateVenue,
  deleteVenue,
};

export default venuesController;
