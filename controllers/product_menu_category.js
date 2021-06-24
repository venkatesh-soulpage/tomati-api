import models from "../models";

import _ from "lodash";

//Tomati controllers

const getProductMenuCategories = async (req, res, next) => {
  try {
    // Get brief
    const menu_categories =
      await models.ProductMenuCategory.query().withGraphFetched(
        `[outlet_venue]`
      );

    // Send the clientss
    return res.status(200).send(menu_categories);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const getProductMenuCategory = async (req, res, next) => {
  try {
    const { menu_category_id } = req.params;
    const menu_category = await models.ProductMenuCategory.query()
      .withGraphFetched(`[outlet_venue]`)
      .findById(menu_category_id);
    if (!menu_category) return res.status(400).send("Invalid payload");
    // Send the clientss
    return res.status(200).send(menu_category);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createproductMenuCategory = async (req, res, next) => {
  try {
    const { role } = req;
    if (!_.includes(["ADMIN", "MANAGER"], role))
      return res
        .status(400)
        .send("This user has no privileges to create category");

    const { name, sequence, venue } = req.body;
    if (!name || !venue) return res.status(400).send("Invalid payload");
    const outlet_venue = await models.OutletVenue.query().findById(venue);
    if (!outlet_venue) return res.status(400).json("invalid venue");

    await models.ProductMenuCategory.query().insert({
      name,
      sequence,
      outlet_venue_id: venue,
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
    if (!_.includes(["ADMIN", "MANAGER"], role))
      return res
        .status(400)
        .send("This user has no privileges to delete category");

    const { menu_category_id } = req.params;
    const menu_category = await models.ProductMenuCategory.query().findById(
      menu_category_id
    );
    if (!menu_category) return res.status(400).send("Invalid payload");
    await models.OutletVenueMenu.query()
      .update({ menu_category: null })
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
    if (!_.includes(["ADMIN", "MANAGER"], role))
      return res
        .status(400)
        .send("This user has no privileges to update category");

    const { name, sequence, venue } = req.body;

    const { menu_category_id } = req.params;
    const foundMenuCategory = await models.ProductMenuCategory.query().findById(
      menu_category_id
    );
    if (!foundMenuCategory) return res.status(400).send("Invalid category id");
    let outlet_venue_id;
    if (venue) {
      const outlet_venue = await models.OutletVenue.query().findById(venue);
      if (!outlet_venue) return res.status(400).json("invalid venue");
      outlet_venue_id = venue;
    }

    await models.ProductMenuCategory.query()
      .update({ name, sequence, outlet_venue_id })
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
  getProductMenuCategory,
};

export default productMenuCategoryController;
