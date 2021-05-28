import models from "../models";
const { s3 } = require("../utils/s3Config");
import _ from "lodash";

//Tomati controllers

const getVenueMenu = async (req, res, next) => {
  try {
    // Get brief
    const { outlet_venue_id } = req.params;
    const menu = await models.OutletVenueMenu.query()
      .withGraphFetched(
        "[product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],free_sides.[side_detail],paid_sides.[side_detail]]"
      )
      .where("outlet_venue_id", outlet_venue_id);

    if (menu.length === 0) return res.status(400).send("Invalid venue id");

    // Send the clientss
    return res.status(200).send(menu);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const uploadImage = async (file_data) => {
  const { key, buf } = file_data;

  var data = {
    Key: key,
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Body: buf,
    ContentEncoding: "base64",
    ContentType: "image/png",
  };
  await s3.putObject(data, function (err, data) {
    if (err) {
      console.log(err);
      console.log("Error uploading data: ", data);
    } else {
      console.log("successfully uploaded the image!", data);
    }
  });
};

const createVenueMenuProduct = async (req, res, next) => {
  try {
    // Get brief
    const { outlet_venue_id } = req.params;
    const venue = await models.OutletVenue.query().findById(outlet_venue_id);
    if (!venue) return res.status(400).send("Invalid venue id");
    const item = req.body;
    let buf, product_image;
    if (item.product_image) {
      product_image = item.product_image;
      buf = Buffer.from(
        product_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }
    if (buf && product_image) {
      let key = `public/cover_images/outletvenues/${product_image.name}`;
      uploadImage({ key, buf });
      item.product_image = `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`;
    }
    item.outlet_venue_id = outlet_venue_id;
    const free_sides = item.free_sides;
    delete item.free_sides;
    const paid_sides = item.paid_sides;
    delete item.paid_sides;
    const menu = await models.OutletVenueMenu.query().insert(item);
    const { product_categories, product_tag, cuisine_type } = item;
    const product_category_data = _.map(
      product_categories,
      (product, index) => {
        return {
          menu_product_id: menu.id,
          menu_product_category: product,
          outlet_venue_id: outlet_venue_id,
        };
      }
    );
    const product_tag_data = _.map(product_tag, (product, index) => {
      return {
        menu_product_id: menu.id,
        menu_product_tags: product,
        outlet_venue_id: outlet_venue_id,
      };
    });
    const cuisine_type_data = _.map(cuisine_type, (product, index) => {
      return {
        menu_product_id: menu.id,
        menu_cuisine_type: product,
        outlet_venue_id: outlet_venue_id,
      };
    });
    const free_sides_data = _.map(free_sides, (product, index) => {
      return {
        menu_product_id: menu.id,
        product_side_id: product,
        outlet_venue_id: outlet_venue_id,
      };
    });
    const paid_sides_data = _.map(paid_sides, (product, index) => {
      return {
        menu_product_id: menu.id,
        product_side_id: product,
        outlet_venue_id: outlet_venue_id,
      };
    });
    await models.MenuProductCategory.query().insert(product_category_data);
    await models.MenuProductTags.query().insert(product_tag_data);
    await models.MenuCuisineType.query().insert(cuisine_type_data);
    await models.MenuProductFreeSides.query().insert(free_sides_data);
    await models.MenuProductPaidSides.query().insert(paid_sides_data);
    // Send the clientss
    return res.status(200).send("Created Successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const updateVenueMenuProduct = async (req, res, next) => {
  try {
    // Get brief
    const { venue_menu_id } = req.params;
    const menu = await models.OutletVenueMenu.query().findById(venue_menu_id);
    if (!menu) return res.status(400).send("Invalid venuemenu id");

    let buf, product_image;
    if (req.body.product_image) {
      product_image = req.body.product_image;
      buf = Buffer.from(
        product_image.data.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
    }
    if (buf && product_image) {
      let key = `public/cover_images/outletvenues/${product_image.name}`;
      uploadImage({ key, buf });
      const menu = await models.OutletVenueMenu.query()
        .update({
          product_image: `https://s3.${process.env.BUCKETEER_AWS_REGION}.amazonaws.com/${process.env.BUCKETEER_BUCKET_NAME}/${key}`,
        })
        .where("id", venue_menu_id);
    }
    const {
      name,
      price,
      description,
      menu_category,
      product_category,
      maximum_sides,
      preparation_time,
      product_categories,
      product_tag,
      cuisine_type,
      is_published,
      free_sides,
      paid_sides,
    } = req.body;

    await models.OutletVenueMenu.query()
      .update({
        name,
        price,
        description,
        menu_category,
        product_category,
        maximum_sides,
        preparation_time,
        is_published,
      })
      .where("id", venue_menu_id);

    if (product_categories && !_.isEmpty(product_categories)) {
      const product_category_data = _.map(
        product_categories,
        (product, index) => {
          return {
            menu_product_id: menu.id,
            menu_product_category: product,
            outlet_venue_id: menu.outlet_venue_id,
          };
        }
      );
      await models.MenuProductCategory.query()
        .delete()
        .where({ menu_product_id: venue_menu_id });
      await models.MenuProductCategory.query().insert(product_category_data);
    }

    if (product_tag && !_.isEmpty(product_tag)) {
      const product_tag_data = _.map(product_tag, (product, index) => {
        return {
          menu_product_id: menu.id,
          menu_product_tags: product,
          outlet_venue_id: menu.outlet_venue_id,
        };
      });
      await models.MenuProductTags.query()
        .delete()
        .where({ menu_product_id: venue_menu_id });
      await models.MenuProductTags.query().insert(product_tag_data);
    }

    if (cuisine_type && !_.isEmpty(cuisine_type)) {
      const cuisine_type_data = _.map(cuisine_type, (product, index) => {
        return {
          menu_product_id: menu.id,
          menu_cuisine_type: product,
          outlet_venue_id: menu.outlet_venue_id,
        };
      });
      await models.MenuCuisineType.query()
        .delete()
        .where({ menu_product_id: venue_menu_id });
      await models.MenuCuisineType.query().insert(cuisine_type_data);
    }

    if (free_sides && !_.isEmpty(free_sides)) {
      const sides_data = _.map(free_sides, (product, index) => {
        return {
          menu_product_id: menu.id,
          product_side_id: product,
          outlet_venue_id: menu.outlet_venue_id,
        };
      });
      await models.MenuProductFreeSides.query()
        .delete()
        .where({ menu_product_id: venue_menu_id });
      await models.MenuProductFreeSides.query().insert(sides_data);
    }
    if (paid_sides && !_.isEmpty(paid_sides)) {
      const sides_data = _.map(paid_sides, (product, index) => {
        return {
          menu_product_id: menu.id,
          product_side_id: product,
          outlet_venue_id: menu.outlet_venue_id,
        };
      });
      await models.MenuProductPaidSides.query()
        .delete()
        .where({ menu_product_id: venue_menu_id });
      await models.MenuProductPaidSides.query().insert(sides_data);
    }
    // Send the clientss
    return res.status(200).send("Updated successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const deleteVenueMenuProduct = async (req, res, next) => {
  try {
    // Get brief
    const { venue_menu_id } = req.params;
    const menu = await models.OutletVenueMenu.query().findById(venue_menu_id);
    if (!menu) return res.status(400).send("Invalid venuemenu id");

    await models.MenuProductCategory.query()
      .delete()
      .where({ menu_product_id: venue_menu_id });
    await models.MenuProductTags.query()
      .delete()
      .where({ menu_product_id: venue_menu_id });
    await models.MenuCuisineType.query()
      .delete()
      .where({ menu_product_id: venue_menu_id });
    await models.MenuProductFreeSides.query()
      .delete()
      .where({ menu_product_id: venue_menu_id });
    await models.MenuProductPaidSides.query()
      .delete()
      .where({ menu_product_id: venue_menu_id });
    await models.OutletVenueMenu.query().where("id", venue_menu_id).delete();
    // Send the clientss
    return res.status(200).send("Deleted successfully");
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const getVenueMenuProduct = async (req, res, next) => {
  try {
    // Get brief
    const { venue_menu_id } = req.params;
    const menu = await models.OutletVenueMenu.query()
      .withGraphFetched(
        "[product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],free_sides.[side_detail],paid_sides.[side_detail]]"
      )
      .findById(venue_menu_id);
    if (!menu) return res.status(400).send("Invalid venuemenu id");

    // Send the clientss
    return res.status(200).send(menu);
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const planController = {
  getVenueMenu,
  createVenueMenuProduct,
  updateVenueMenuProduct,
  deleteVenueMenuProduct,
  getVenueMenuProduct,
};

export default planController;