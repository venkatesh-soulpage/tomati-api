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
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to create category");

    const { name, sequence } = req.body;
    if (!name || !sequence) return res.status(400).send("Invalid payload");
    const category = await models.ProductCategory.query().findOne({ name });
    const category_sequence = await models.ProductCategory.query().findOne({
      sequence,
    });
    if (category)
      return res
        .status(400)
        .send("Category with same name already exists please try other");
    if (category_sequence)
      return res
        .status(400)
        .send("Category with same sequence already exists please try other");

    await models.ProductCategory.query().insert({
      name,
      sequence,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteProductCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to delete category");

    const { category_id } = req.params;
    const category = await models.ProductCategory.query().findById(category_id);
    if (!category) return res.status(400).send("Invalid payload");
    await models.MenuProductCategory.query()
      .delete()
      .where({ menu_product_category: category_id });
    await models.ProductCategory.query().deleteById(category_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const updateProductCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to update category");

    const { name, sequence } = req.body;

    const { category_id } = req.params;
    const foundCategory = await models.ProductCategory.query().findById(
      category_id
    );
    if (!foundCategory) return res.status(400).send("Invalid category id");
    const category =
      name && (await models.ProductCategory.query().findOne({ name }));
    const category_sequence =
      sequence &&
      (await models.ProductCategory.query().findOne({
        sequence,
      }));
    if (category)
      return res
        .status(400)
        .send("Category with same name already exists please try other");
    if (category_sequence)
      return res
        .status(400)
        .send("Category with same sequence already exists please try other");
    await models.ProductCategory.query()
      .update({ name, sequence })
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
