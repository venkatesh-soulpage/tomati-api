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
    const {
      first_name,
      last_name,
      plan,
      email,
      address,
      city,
      state,
    } = req.body;
    chargebee.configure({
      site: `${process.env.CHARGEBEE_SITE}`,
      api_key: `${process.env.CHARGEBEE_API_KEY}`,
    });
    chargebee.hosted_page
      .checkout_new({
        subscription: {
          plan_id: plan,
        },
        customer: {
          id: "cbdemo_sir",
        },
      })
      .request(function (error, result) {
        if (error) {
          //handle error
          console.log(error);
        } else {
          res.send(result.hosted_page);
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
