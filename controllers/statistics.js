import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const getCounInfo = async (req, res, next) => {
  try {
    const response = await models.Statistics.query().withGraphFetched(
      "[venue_id,event_id]"
    );
    const eventsData = [];
    const venueData = [];
    for (let res of response) {
      if (res.outletevent_id === null) {
        const venueObject = {};
        venueObject.id = res.id;
        venueObject.outletvenue_id = res.outletvenue_id;
        venueObject.venueName = res.venue_id[0].name;
        venueObject.address = res.venue_id[0].address;
        venueObject.scannedCount = res.count;
        venueData.push(venueObject);
      } else {
        const eventObject = {};
        eventObject.id = res.id;
        eventObject.outletevent_id = res.outletevent_id;
        eventObject.eventName = res.event_id[0].name;
        eventObject.startTime = res.event_id[0].start_time;
        eventObject.guestsExpected = res.event_id[0].expected_guests;
        eventObject.scannedCount = res.count;
        eventsData.push(eventObject);
      }
    }
    res.status(200).send({ Status: true, venueData, eventsData });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const statisticsController = {
  getCounInfo,
};

export default statisticsController;
