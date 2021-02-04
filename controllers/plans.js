import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const getplans = async (req, res, next) => {
  try {
    // Get brief
    const plans = await models.Plan.query();

    if (plans.length === 0) return res.status(400).send("No Plans Created Yet");

    // Send the clientss
    return res.status(200).send(plans);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const postPlans = async (req, res, next) => {
  try {
    const { data } = req.body;
    const insertedPlans = await models.Plan.query().insert(data);
    return res.status(200).send("Inserted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const planController = {
  getplans,
  postPlans,
};

export default planController;
