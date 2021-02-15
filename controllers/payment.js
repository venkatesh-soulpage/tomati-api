import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";
var chargebee = require("chargebee");

import _, { result } from "lodash";

const makePayment = async (req, res, next) => {
  try {
    const { first_name, last_name, email, address, city, state } = req.body;
    chargebee.configure({
      site: `${process.env.CHARGEBEE_SITE}`,
      api_key: `${process.env.CHARGEBEE_API_KEY}`,
    });
    chargebee.subscription
      .create({
        plan_id: `${process.env.CHARGEBEE_PLAN}`,
        auto_collection: "off",
        billing_address: {
          first_name: first_name,
          last_name: last_name,
          line1: address,
          city: city,
          state: state,
        },
        customer: {
          first_name: first_name,
          last_name: last_name,
          email: email,
        },
      })
      .request(function (error, result) {
        if (error) {
          //handle error
          console.log(error);
          res
            .status(400)
            .json({ Status: false, Message: JSON.stringify(error) });
        } else {
          console.log(result, "RESULT");
          var subscription = result.subscription;
          var customer = result.customer;
          var card = result.card;
          var invoice = result.invoice;
          var unbilled_charges = result.unbilled_charges;
          return res
            .status(200)
            .json({ Status: true, Message: "Payment done successfully" });
        }
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const paymentController = {
  makePayment,
};

export default paymentController;
