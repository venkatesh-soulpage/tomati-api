import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const getDiscounts = async (req, res, next) => {
  try {
    // Get brief
    const discounts = await models.Discount.query().orderBy("id", "asc");

    if (discounts.length === 0)
      return res.status(400).send("No discounts at present");

    // Send the clientss
    return res.status(200).send(discounts);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const postDiscounts = async (req, res, next) => {
  try {
    const { account_id } = req;
    const account = await models.Account.query().where("id", account_id);

    if (account[0].is_admin) {
      const { data } = req.body;
      const insertedDiscounts = await models.Discount.query().insert(data);
      return res.status(200).send("Inserted Successfully");
    }
    return res.status(400).send("This user has no privilege to add discounts");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getDiscount = async (req, res, next) => {
  try {
    const { discount_code } = req.body;
    if (!discount_code) {
      return res.status(400).send("Invalid discount code");
    }
    const discountDetails = await models.Discount.query().findOne(
      "discount_code",
      discount_code
    );
    if (discountDetails) {
      return res.status(200).send(discountDetails);
    }
    return res.status(400).send("Couldn't find the discount code");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const planController = {
  getDiscounts,
  postDiscounts,
  getDiscount,
};

export default planController;
