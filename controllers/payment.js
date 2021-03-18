import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";
var chargebee = require("chargebee");

import _, { result } from "lodash";

chargebee.configure({
  site: `${process.env.CHARGEBEE_SITE}`,
  api_key: `${process.env.CHARGEBEE_API_KEY}`,
});

//Tomati Controllers
const makePayment = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      plan,
      addons,
      customer,
      coupon,
      billing_address,
      email,
      address,
      city,
      state,
    } = req.body;
    // chargebee.hosted_page
    //   .checkout_new({
    //     subscription: {
    //       plan_id: plan,
    //     },
    //     addons,
    //     customer,
    //     coupon_ids: coupon,
    //     billing_address,
    //     redirect_url: req.headers.origin + "/success",
    //   })
    chargebee.hosted_page
      .checkout_new({
        customer: {
          first_name: "Preetham Varnasi",
          email: "varanasipreetham999@gmail.com",
        },
        subscription: {
          plan_id: "starter-monthly",
        },
        // addons: [
        // {
        //   id: "free-vip-support",
        //   // unit_price: 0,
        //   quantity: 1,
        // },
        // {
        //   id: "starter-menu-monthly",
        //   // unit_price: 0,
        //   quantity: 1,
        // },
        // ],
        // customer,
        // coupon_ids: coupon,
        // billing_address,
        // redirect_url: req.headers.origin + "/success",
      })
      .request(function (error, result) {
        if (error) {
          //handle error
          console.log(error);
        } else {
          console.log(result, "RESULT");
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

const retriveSubscriptionById = async (req, res, next) => {
  try {
    const { subscription_id } = req.body;
    if (!subscription_id) return res.status(400).send("Invalid payload");
    const details = await chargebee.subscription
      .retrieve(subscription_id)
      .request();
    return res.status(200).json(details);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const retriveCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.body;
    if (!couponId || !req.body) {
      return res.status(400).send("Enter valid coupon");
    }
    chargebee.coupon.retrieve(couponId).request(function (error, result) {
      if (error) {
        //handle error
        console.log(error);
        return res.status(400).send(error.message);
      } else {
        console.log(result);
        var coupon = result.coupon;
        return res.status(200).json(coupon);
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getSubscriptionDetails = async (req, res, next) => {
  try {
    const id = req.body.subscription_id;
    if (!id) return res.status(400).send("Invalid Payload");
    const plans = await models.Plan.query();
    const details = await chargebee.subscription.retrieve(id).request();
    const plan = plans.find(
      (plan) => plan.chargebee_plan_id === details.subscription.plan_id
    );
    if (!plan) return res.status(400).send("Subscription plan id");
    let subscription = plan.plan;
    let outlet_limit = 0;
    let event_limit = 0;
    let user_limit = 0;
    let qr_limit = 0;
    for (let addon of details.subscription.addons) {
      if (addon.id === plan.chargebee_free_outlets_addon_id) {
        outlet_limit += addon.quantity;
      } else if (addon.id === plan.chargebee_paid_outlets_addon_id) {
        outlet_limit += addon.quantity;
      } else if (addon.id === plan.chargebee_free_events_addon_id) {
        event_limit += addon.quantity;
      } else if (addon.id === plan.chargebee_paid_events_addon_id) {
        event_limit += addon.quantity;
      } else if (addon.id === plan.chargebee_free_collaborators_addon_id) {
        user_limit += addon.quantity;
      } else if (addon.id === plan.chargebee_paid_collaborators_addon_id) {
        user_limit += addon.quantity;
      } else {
        console.log("INVALID ID HAS BEEN CREATED WHILE SUBSCRIBING");
      }
    }
    return res
      .status(200)
      .json({ subscription, outlet_limit, event_limit, user_limit, qr_limit });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateCustomerEmail = async (req, res, next) => {
  try {
    const { subscription_id, email } = req.body;
    chargebee.customer
      .update(subscription_id, {
        email,
      })
      .request(async (error, result) => {
        if (error) {
          //handle error
          console.log(error);
          return res.status(500).json(JSON.stringify(error));
        } else {
          await models.Account.query()
            .update({ email })
            .where("transaction_id", subscription_id);
          return res.status(200).json("Updated successfully");
        }
      });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateSubscriptionThroughCheckout = async (req, res, next) => {
  const plan = await models.Plan.query().where("plan", "starter").first();
  chargebee.hosted_page
    .checkout_existing({
      subscription: {
        id: "AzZlqkSQboC8r12ov",
        plan_id: "tomati-growth",
      },

      // replace_addon_list: true,
      // addons: [
      //   {
      //     id: plan.chargebee_outlets_addon_id,
      //     unit_price: 1000,
      //     quantity: plan.outlet_limit,
      //   },
      //   {
      //     id: plan.chargebee_events_addon_id,
      //     unit_price: 1000,
      //     quantity: plan.event_limit,
      //   },
      //   {
      //     id: plan.chargebee_collaborators_addon_id,
      //     unit_price: 1000,
      //     quantity: plan.user_limit,
      //   },
      // ],
    })
    .request(function (error, result) {
      if (error) {
        //handle error
        console.log(error);
      } else {
        console.log(result);
        var hosted_page = result.hosted_page;
        res.send(result.hosted_page);
      }
    });
};

const paymentController = {
  makePayment,
  updateSubscription,
  retriveSubscriptionById,
  retriveCoupon,
  getSubscriptionDetails,
  updateSubscriptionThroughCheckout,
  updateCustomerEmail,
};

export default paymentController;
