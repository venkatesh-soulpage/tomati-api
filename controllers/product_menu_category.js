import models from "../models";

import _ from "lodash";

//Tomati controllers

const getProductMenuCategories = async (req, res, next) => {
  try {
    // Get brief
    const menu_categories = await models.ProductMenuCategory.query();

    // Send the clientss
    return res.status(200).send(menu_categories);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createproductMenuCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to create category");

    const { name, sequence } = req.body;
    if (!name || !sequence) return res.status(400).send("Invalid payload");
    const menu_category = await models.ProductMenuCategory.query().findOne({
      name,
    });
    const menu_category_sequence =
      await models.ProductMenuCategory.query().findOne({
        sequence,
      });
    if (menu_category)
      return res
        .status(400)
        .send("Menu category with same name already exists please try other");
    if (menu_category_sequence)
      return res
        .status(400)
        .send(
          "Menu category with same sequence already exists please try other"
        );

    await models.ProductMenuCategory.query().insert({
      name,
      sequence,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteProductMenuCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to delete category");

    const { menu_category_id } = req.params;
    const menu_category = await models.ProductMenuCategory.query().findById(
      menu_category_id
    );
    if (!menu_category) return res.status(400).send("Invalid payload");
    await models.MenuCategory.query()
      .delete()
      .where({ menu_category: menu_category_id });
    await models.ProductMenuCategory.query().deleteById(menu_category_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateProductMenuCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res
        .status(400)
        .send("This user has no privileges to update category");

    const { name, sequence } = req.body;

    const { menu_category_id } = req.params;
    const foundMenuCategory = await models.ProductMenuCategory.query().findById(
      menu_category_id
    );
    if (!foundMenuCategory) return res.status(400).send("Invalid category id");
    const menu_category =
      name && (await models.ProductMenuCategory.query().findOne({ name }));
    const menu_category_sequence =
      sequence &&
      (await models.ProductMenuCategory.query().findOne({
        sequence,
      }));
    if (menu_category)
      return res
        .status(400)
        .send("Menu category with same name already exists please try other");
    if (menu_category_sequence)
      return res
        .status(400)
        .send(
          "Menu category with same sequence already exists please try other"
        );
    await models.ProductMenuCategory.query()
      .update({ name, sequence })
      .where("id", menu_category_id);
    return res.status(200).send("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const productMenuCategoryController = {
  getProductMenuCategories,
  createproductMenuCategory,
  deleteProductMenuCategory,
  updateProductMenuCategory,
};

export default productMenuCategoryController;
