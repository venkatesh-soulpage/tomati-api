import models from "../models";

import _ from "lodash";

//Tomati controllers

const getDrinks = async (req, res, next) => {
  try {
    // Get brief
    const drinks = await models.Drinks.query();

    // Send the clientss
    return res.status(200).send(drinks);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createDrink = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to create drink");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");
    const drink = await models.Drinks.query().findOne({ name });
    if (drink)
      return res
        .status(400)
        .send("Drink name with same already exists please try other");
    await models.Drinks.query().insert({
      name,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteDrink = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to delete drink");

    const { drink_id } = req.params;
    await models.Drinks.query().deleteById(drink_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const updateDrink = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to update drink");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    const { drink_id } = req.params;
    const founddrink = await models.Drinks.query().findById(drink_id);
    if (!founddrink) return res.status(400).send("Invalid drink id");

    const drink = await models.Drinks.query().findOne({ name });
    if (drink)
      return res
        .status(400)
        .send("Drink name with same already exists please try other");

    await models.Drinks.query().update({ name }).where("id", drink_id);
    return res.status(200).send("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const DrinksController = {
  getDrinks,
  createDrink,
  deleteDrink,
  updateDrink,
};

export default DrinksController;
