import models from "../models";

import _ from "lodash";

const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await models.Plan.query().orderBy("id", "desc");

    res.status(200).send({ subscriptions });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const createSubscription = async (req, res, next) => {
  try {
    await models.Plan.query().insert(req.body.data);

    // Send the clients
    return res.status(201).json("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const subscriptionController = {
  getSubscriptions,
  createSubscription,
};

export default subscriptionController;
