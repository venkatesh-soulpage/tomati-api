import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const postOrderInfo = async (req, res, next) => {
  try {
    const body = req.body.data;
    const customer_name = req.body.customer_name;
    const { account_id } = req;
    for (let info of body) {
      info.customer_name = customer_name;
      info.updated_by = account_id;
    }
    const response = await models.OrderInfo.query().insert(body);
    return res.status(200).send({ Status: true, insertedData: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const getOrderInfo = async (req, res, next) => {
  try {
    const { IDS } = req.body;
    const response = await models.OrderInfo.query()
      .withGraphFetched("[ordered_venue_product_id, ordered_event_product_id]")
      .whereIn("id", IDS);
    return res.status(200).send({ Status: true, orders: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const putOrderInfo = async (req, res, next) => {
  try {
    const { ids, payment_type } = req.body;
    const { account_id } = req;
    const response = await models.OrderInfo.query()
      .whereIn("id", ids)
      .update({ billed: true, payment_type: payment_type });
    return res.status(200).send({ Status: true, insertedData: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const orderInfoController = {
  postOrderInfo,
  getOrderInfo,
  putOrderInfo,
};

export default orderInfoController;
