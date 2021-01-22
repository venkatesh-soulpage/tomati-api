import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import { sendInviteCode } from "./mailling";
import AWS from "aws-sdk";

import _ from "lodash";

import { jsPDF } from "jspdf";

const QRCode = require("qrcode");
var fs = require("fs");
const isBase64 = require("is-base64");

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
    return res.status(500).json(JSON.stringify(e));
  }
};

// GET - Get an specific event with an id
const getEvent = async (req, res, next) => {
  try {
    const { outlet_event_id } = req.params;
    const ipAddress = req.connection.remoteAddress;
    const countObject = { ip: ipAddress, time: +new Date() };

    if (!outlet_event_id) return res.status(400).json("Invalid ID");

    const event = await models.OutletEvent.query()
      .withGraphFetched(`[menu, location]`)
      .findById(outlet_event_id);

    if (!event) return res.status(400).json("Invalid ID");

    const record = await models.Statistics.query().where(
      "outletevent_id",
      outlet_event_id
    );

    if (record.length === 0) {
      await models.Statistics.query().insert({
        outletevent_id: outlet_event_id,
        count: { data: [countObject] },
      });
    } else {
      const data = record[0].count.data;
      data.push(countObject);
      await models.Statistics.query()
        .where("outletevent_id", outlet_event_id)
        .update({ count: { data } });
    }

    return res.status(200).json(event);
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

const createEvent = async (req, res, next) => {
  try {
    const { account_id, scope } = req;
    const {
      name,
      phone_number,
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
    } else if (req.body.cover_image) {
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
      phone_number,
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
    return res.status(201).json("Event Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { account_id, scope } = req;

    const { outlet_event_id } = req.params;

    const outletevent = await models.OutletEvent.query().findById(
      outlet_event_id
    );

    if (!outlet_event_id || !outletevent)
      return res.status(400).json("Invalid ID");

    if (_.size(req.body) < 1) return res.status(400).json("No Data to update");

    const {
      name,
      phone_number,
      description,
      address,
      location_id,
      start_time,
      end_time,
      expected_guests,
      expected_hourly_guests,
      comments,
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
      const key = `public/cover_images/outletevents/${cover_image.name}`;
      uploadImage({ key, buf });
      await models.OutletEvent.query()
        .update({
          cover_image: `https://s3.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
        })
        .where("id", outlet_event_id);
    }

    await models.OutletEvent.query()
      .update({
        name,
        phone_number,
        description,
        address,
        location_id,
        start_time,
        end_time,
        expected_guests,
        expected_hourly_guests,
        comments,
        account_id,
      })
      .where("id", outlet_event_id);
    return res.status(200).json("Event Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { outlet_event_id } = req.params;

    const outletevent = await models.OutletEvent.query().findById(
      outlet_event_id
    );

    if (!outlet_event_id || !outletevent)
      return res.status(400).json("Invalid ID");

    await models.OutletEventMenu.query()
      .where("outlet_event_id", outlet_event_id)
      .delete();

    await models.OutletEvent.query().deleteById(outlet_event_id);

    return res.status(200).json("Succesfully Deleted");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const generateQRCode = async (outlet_event_id) => {
  //
  const key = `public/qr_codes/outletevents/${outlet_event_id}.png`;

  let APP_HOST = `${process.env.SCHEMA}://${process.env.APP_HOST}`;

  if (process.env.APP_PORT) {
    APP_HOST += ":" + process.env.APP_PORT;
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
    return res.status(201).json("EventMenu Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const eventsController = {
  getEvents,
  getEvent,
  createEvent,
  createEventMenu,
  updateEvent,
  deleteEvent,
};

export default eventsController;
