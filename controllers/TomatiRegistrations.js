import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const postRegistrations = async (req, res, next) => {
  try {
    let {
      full_name,
      company_name,
      email,
      password_hash,
      location,
      street_address,
      plan_id,
      no_of_outlets,
      no_of_qrcodes,
      registration_type,
      is_billed,
      is_privacy_agreed,
      payment_type,
      transaction_id,
    } = req.body;

    if (plan_id === 1 && no_of_outlets > 1) {
      return res
        .status(400)
        .json(
          "Failed to register.Upgrade to premium to register more than one outlet or event"
        );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    password_hash = await bcrypt.hash(password_hash, salt);

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account.length > 0) {
      return res.status(400).json("Email already exists");
    }
    if (plan_id === 1) {
      // Add new user
      const new_account = await models.Account.query().insert({
        email: email,
        first_name: full_name,
        last_name: full_name,
        location,
        password_hash: password_hash,
        is_admin: false,
        is_email_verified: true,
        is_age_verified: false,
        no_of_outlets,
        no_of_qrcodes,
        plan_id,
        transaction_id,
      });
      const account_id = new_account.id;
      if (registration_type === "outlet") {
        const new_venue = await models.OutletVenue.query().insert({
          name: company_name,
          address: street_address,
          account_id,
          location_id: location,
        });
      } else if (registration_type === "event") {
        const new_outlet_event = await models.OutletEvent.query().insert({
          name: company_name,
          account_id,
          location_id: location,
          address: street_address,
        });
      } else {
        return res.status(400).json("Please enter valid registration type");
      }
      res.status(200).send({
        Status: true,
        Message: "Registered succesfully",
      });
    } else {
      if (payment_type === "online") {
        // is_approved = true;

        // Add new user
        const new_account = await models.Account.query().insert({
          email: email,
          first_name: full_name,
          last_name: full_name,
          location,
          password_hash: password_hash,
          is_admin: false,
          is_email_verified: true,
          is_age_verified: false,
          no_of_outlets,
          no_of_qrcodes,
          plan_id,
          transaction_id,
        });
        const account_id = new_account.id;
        if (registration_type === "outlet") {
          const new_venue = await models.OutletVenue.query().insert({
            name: company_name,
            address: street_address,
            account_id,
            location_id: location,
          });
        } else if (registration_type === "event") {
          const new_outlet_event = await models.OutletEvent.query().insert({
            name: company_name,
            account_id,
            location_id: location,
            address: street_address,
          });
        } else {
          return res.status(400).json("Please enter valid registration type");
        }
        res.status(200).send({
          Status: true,
          Message: "Registered succesfully",
        });
      } else if (payment_type === "offline") {
        // Add new Temperory oultet or event
        const newOutlet = await models.tempOutletRegistrations.query().insert({
          full_name,
          company_name,
          email,
          password_hash,
          location,
          street_address,
          plan: plan_id,
          no_of_outlets,
          no_of_qrcodes,
          registration_type,
          is_billed,
          is_privacy_agreed,
          payment_type,
        });
        res.status(200).send({
          Status: true,
          Message: "Registered succesfully please wait for the approval",
        });
      } else {
        return res.status(400).json("Please enter valid payment type");
      }
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
      plan_id,
      no_of_outlets,
      no_of_qrcodes,
      registration_type,
    } = temporary_outlet[0];

    // Check if the account doesn't exist
    const account = await models.Account.query().where("email", email);

    // If the account exist, return message
    if (account.length > 0) {
      return res.status(400).json("Email already exists");
    }

    // Add new user
    const new_account = await models.Account.query().insert({
      email,
      first_name: full_name,
      last_name: full_name,
      location,
      password_hash,
      is_admin: false,
      is_email_verified: true,
      is_age_verified: false,
      no_of_outlets,
      no_of_qrcodes,
      plan_id,
      transaction_id,
    });
    const account_id = new_account.id;
    if (registration_type === "outlet") {
      const new_venue = await models.OutletVenue.query().insert({
        name: company_name,
        address: street_address,
        account_id,
        location_id: location,
      });
    } else if (registration_type === "event") {
      const new_outlet_event = await models.OutletEvent.query().insert({
        name: company_name,
        account_id,
        location_id: location,
        address: street_address,
      });
    } else {
      return res.status(400).json("Please enter valid registration type");
    }
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
