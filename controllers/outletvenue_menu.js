import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

//Tomati controllers

const getvenuemenu = async (req, res, next) => {
  try {
    // Get brief
    const { venue_id } = req.params;
    const menue = await models.OutletVenueMenu.query()
      .withGraphFetched("[product_category]")
      .where("outlet_venue_id", venue_id);

    if (menue.length === 0) return res.status(400).send("Invalid venue id");

    // Send the clientss
    return res.status(200).send(menue);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const planController = {
  getvenuemenu,
};

export default planController;
