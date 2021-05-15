import models from "../models";

import _ from "lodash";

//Tomati controllers

const getProductCategories = async (req, res, next) => {
  try {
    // Get brief
    const categories = await models.ProductCategory.query();

    // Send the clientss
    return res.status(200).send(categories);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createproductCategory = async (req, res, next) => {
  try {
    const { account_id } = req;
    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to create category");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    await models.ProductCategory.query().insert({
      name,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteProductCategory = async (req, res, next) => {
  try {
    const { account_id } = req;

    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to delete category");

    const { category_id } = req.params;

    const category = await models.ProductCategory.query().findById(category_id);
    if (!category) return res.status(400).send("Invalid category Id");

    await models.ProductCategory.query().deleteById(category_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const updateProductCategory = async (req, res, next) => {
  try {
    const { account_id } = req;
    const user = await models.Account.query().findById(account_id);
    if (!user.is_admin)
      return res
        .status(400)
        .send("This user has no privileges to update category");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    const { category_id } = req.params;

    const category = await models.ProductCategory.query().findById(category_id);
    if (!category) return res.status(400).send("Invalid category Id");

    await models.ProductCategory.query()
      .update({ name })
      .where("id", category_id);
    return res.status(200).send("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const productCategoryController = {
  getProductCategories,
  createproductCategory,
  deleteProductCategory,
  updateProductCategory,
};

export default productCategoryController;
