import models from "../models";

import _ from "lodash";

//Tomati controllers

const getProductTags = async (req, res, next) => {
  try {
    // Get brief
    const tags = await models.ProductTags.query();

    // Send the clientss
    return res.status(200).send(tags);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const createproductTag = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res.status(400).send("This user has no privileges to create tags");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");
    const tag = await models.ProductTags.query().findOne({ name });
    if (tag)
      return res
        .status(400)
        .send("Product tag with same already exists please try other");

    await models.ProductTags.query().insert({
      name,
    });
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteProductTag = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res.status(400).send("This user has no privileges to delete tag");

    const { tag_id } = req.params;

    await models.ProductTags.query().deleteById(tag_id);
    return res.status(200).send("Deleted Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};
const updateProductTag = async (req, res, next) => {
  try {
    const { role } = req;
    if (role !== "ADMIN")
      return res.status(400).send("This user has no privileges to update tag");

    const { name } = req.body;
    if (!name) return res.status(400).send("Invalid payload");

    const { tag_id } = req.params;
    const foundTag = await models.ProductTags.query().findById(tag_id);
    if (!foundTag) return res.status(400).send("Invalid tag id");

    const tag = await models.ProductTags.query().findOne({ name });
    if (tag)
      return res
        .status(400)
        .send("Product tag with same already exists please try other");

    await models.ProductTags.query().update({ name }).where("id", tag_id);
    return res.status(200).send("Updated Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const productTagsController = {
  getProductTags,
  createproductTag,
  deleteProductTag,
  updateProductTag,
};

export default productTagsController;
