import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import { sendInviteCode } from "./mailling";
import AWS from "aws-sdk";

import { jsPDF } from "jspdf";

const QRCode = require("qrcode");
var fs = require("fs");

// Inititialize AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: process.env.BUCKETEER_AWS_REGION,
});

const getEvents = async (req, res, next) => {
  try {
    // Get brief
    const events = await models.OutletEvent.query()
      .withGraphFetched(`[menu]`)
      .orderBy("created_at", "desc");

    // Send the clientss
    return res.status(200).send(events);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

// GET - Get an specific event with an id
const getEvent = async (req, res, next) => {
  try {
    const { outlet_event_id } = req.params;

    if (!outlet_event_id) return res.status(400).json("Invalid ID").send();

    const event = await models.OutletEvent.query()
      .withGraphFetched(`[menu]`)
      .findById(outlet_event_id);

    return res.status(200).json(event).send();
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

const createEvent = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    const {
      name,
      start_time,
      end_time,
      expected_guests,
      expected_hourly_guests,
      comments,
      location_id,
      address,
      description,
    } = req.body;

    let buf, cover_image;

    if (req.files) {
      cover_image = req.files.cover_image;
      buf = cover_image.data;
    } else {
      cover_image = req.body.cover_image;
      buf = Buffer.from(
        cover_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }

    const key = `public/cover_images/outletevents/${cover_image.name}`;

    uploadImage({ key, buf });

    const new_outlet_event = await models.OutletEvent.query().insert({
      name,
      start_time,
      end_time,
      expected_guests,
      expected_hourly_guests,
      comments,
      location_id,
      account_id,
      address,
      description,
      cover_image: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
    });

    // Send the clients
    return res.status(201).json("Event Created Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const generateQRCode = async (outlet_event_id) => {
  //
  const key = `public/qr_codes/outletevents/${outlet_event_id}.png`;

  let APP_HOST = `${process.env.SCHEMA}://${process.env.APP_HOST}`;

  if (process.env.APP_PORT) {
    APP_HOST += process.env.APP_PORT;
  }

  const APP_URL = APP_HOST + `/outlet/?outlet_event=${outlet_event_id}`;

  const url = await QRCode.toDataURL(`URL: ${APP_URL}`, { width: 1000 });
  const buf = Buffer.from(
    url.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  uploadImage({ key, buf });

  await models.OutletEvent.query()
    .update({
      menu_link: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
    })
    .where({ id: outlet_event_id });
};

const createEventMenu = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    const { outlet_event_id } = req.params;

    for (let item of req.body) {
      item.outlet_event_id = outlet_event_id;
    }

    const menu = await models.OutletEventMenu.query().where({
      outlet_event_id,
    });

    if (menu.length > 0)
      await models.OutletEventMenu.query().delete().where({ outlet_event_id });
    else {
      generateQRCode(outlet_event_id);
    }

    const new_event = await models.OutletEventMenu.query().insertGraph(
      req.body
    );

    // "EventMenu Created Successfully"
    // Send the clients
    return res.status(201).json("EventMenu Created Successfully").send();
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e)).send();
  }
};

const eventsController = {
  getEvents,
  getEvent,
  createEvent,
  createEventMenu,
};

export default eventsController;
