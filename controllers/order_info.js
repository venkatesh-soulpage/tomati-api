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
    const { account_id } = req;
    for (let info of body) {
      info.updated_by = decoded.id;
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
    console.log(IDS, "IDS FROM FRONEND");
    const response = await models.OrderInfo.query()
      .withGraphFetched("[ordered_venue_product_id, ordered_event_product_id]")
      .whereIn("id", IDS);
    console.log(response, "RESPONSE FROM API");
    return res.status(200).send({ Status: true, orders: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const orderInfoController = {
  postOrderInfo,
  getOrderInfo,
};

export default orderInfoController;
