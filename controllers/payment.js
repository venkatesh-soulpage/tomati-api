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
    const { plan, addons, customer } = req.body;
    chargebee.configure({
      site: `${process.env.CHARGEBEE_SITE}`,
      api_key: `${process.env.CHARGEBEE_API_KEY}`,
    });
    chargebee.hosted_page
      .checkout_new({
        subscription: {
          plan_id: plan,
        },
        addons,
        customer,
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

const updateSubscription = async (req, res, next) => {
  try {
    const { subscription_id, addons, plan_id } = req.body;
    chargebee.configure({
      site: `${process.env.CHARGEBEE_SITE}`,
      api_key: `${process.env.CHARGEBEE_API_KEY}`,
    });
    chargebee.subscription
      .update(subscription_id, {
        plan_id,
        // end_of_term: true,
        addons,
      })
      .request(function (error, result) {
        if (error) {
          //handle error
          console.log(error);
        } else {
          // console.log(result);
          var subscription = result.subscription;
          var customer = result.customer;
          var card = result.card;
          var invoice = result.invoice;
          var unbilled_charges = result.unbilled_charges;
          var credit_notes = result.credit_notes;
          res.status(200).json({
            status: true,
            Message: "Subscription Updated Successfully",
          });
        }
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const paymentController = {
  makePayment,
  updateSubscription,
};

export default paymentController;
