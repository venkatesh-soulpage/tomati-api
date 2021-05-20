import models from "../models";

import _ from "lodash";

//Tomati controllers

const getCuisineTypes = async (req, res, next) => {
  try {
    // Get brief
    const cuisines = await models.CuisineType.query();

    // Send the clientss
    return res.status(200).send(cuisines);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createCuisineType = async (req, res, next) => {
  try {
    const { account_id } = req;
    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to create cuisine");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    await models.CuisineType.query().insert({
      name,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteCuisineType = async (req, res, next) => {
  try {
    const { account_id } = req;

    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to delete cuisine");

    const { cuisine_id } = req.params;

    const cuisine = await models.CuisineType.query().findById(cuisine_id);
    if (!cuisine) return res.status(400).send("Invalid cuisine Id");

    await models.CuisineType.query().deleteById(cuisine_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const updateCuisineType = async (req, res, next) => {
  try {
    const { account_id } = req;
    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to update cuisine");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    const { cuisine_id } = req.params;

    const cuisine = await models.CuisineType.query().findById(cuisine_id);
    if (!cuisine) return res.status(400).send("Invalid cuisine Id");

    await models.CuisineType.query().update({ name }).where("id", cuisine_id);
    return res.status(200).send("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const CuisineTypeController = {
  getCuisineTypes,
  createCuisineType,
  deleteCuisineType,
  updateCuisineType,
};

export default CuisineTypeController;
