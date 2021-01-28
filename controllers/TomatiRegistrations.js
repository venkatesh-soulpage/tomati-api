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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    body.password_hash = await bcrypt.hash(body.password_hash, salt);

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", body.email);

    // If the account exist, return message
    if (account.length > 0) {
      return res.status(400).json("Email already exists");
    }

    if (body.payment_type === "online") {
      body.is_approved = true;

      // Add new outlet or event
      const newOutlet = await models.tomatiOutletEvents.query().insert(body);

      // Add new user
      const new_account = await models.Account.query().insert({
        email: body.email,
        first_name: body.full_name,
        last_name: body.company_name,
        password_hash: body.password_hash,
        is_admin: false,
        is_email_verified: true,
        is_age_verified: false,
      });
      res.status(200).send({
        Status: true,
        Data: newOutlet,
        Message: "Registered succesfully",
      });
    } else if (body.payment_type === "offline") {
      // Add new Temperory oultet or event
      const newOutlet = await models.tempOutletRegistrations
        .query()
        .insert(body);
      res.status(200).send({
        Status: true,
        Data: newOutlet,
        Message: "Registered succesfully please wait for the approval",
      });
    } else {
      return res.status(400).json("Plaese enter valid payment type");
    }
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
    const temporary_outlet = await models.tempOutletRegistrations
      .query()
      .where("id", registered_id);
    const {
      full_name,
      company_name,
      email,
      password_hash,
      location,
      street_address,
      plan,
      no_of_outlets,
      no_of_qrcodes,
      registration_type,
      is_billed,
      is_privacy_agreed,
      payment_type,
      is_approved,
    } = temporary_outlet[0];

    // Add new outlet or event
    const newOutlet = await models.tomatiOutletEvents.query().insert({
      full_name,
      company_name,
      email,
      password_hash,
      location,
      street_address,
      plan,
      no_of_outlets,
      no_of_qrcodes,
      registration_type,
      is_billed,
      is_privacy_agreed,
      payment_type,
      is_approved,
    });

    // Add new user
    const new_account = await models.Account.query().insert({
      email,
      first_name: full_name,
      last_name: company_name,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: false,
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
