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
    const newOutlet = await models.tempOutletRegistrations.query().insert(body);
    res.status(200).send({
      Status: true,
      Message: "Registered succesfully please wait for the approval",
    });
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
