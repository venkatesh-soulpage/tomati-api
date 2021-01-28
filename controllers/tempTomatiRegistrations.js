import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const postRegistrations = async (req, res, next) => {
  try {
    const body = req.body;

    // Check if the account doesn't exist
    const outlet = await models.tempOutletRegistrations
      .query()
      .where("email", body.email);

    // If the account exist, return message
    if (outlet.length > 0) {
      return res.status(400).json("Email already exists");
    }

    if (body.payment_type === "online") {
      body.is_approved = true;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    body.password_hash = await bcrypt.hash(body.password_hash, salt);

    // Add new account
    const newOutlet = await models.tempOutletRegistrations.query().insert(body);

    res.status(200).send({
      Status: true,
      Data: newOutlet,
      Message: "Registered succesfully please wait for the approval",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const approveRegistration = async (req, res, next) => {
  try {
    const { registered_id } = req.params;
    const response = await models.tempOutletRegistrations
      .query()
      .where("id", registered_id)
      .update({
        is_approved: true,
      });

    res.status(200).send({
      Status: true,
      Message: "Approved Succesfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const tomatiRegistrationsController = {
  postRegistrations,
  approveRegistration,
};

export default tomatiRegistrationsController;
