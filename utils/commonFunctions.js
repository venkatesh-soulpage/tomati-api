import _ from "lodash";

const outletMenueKeys = [
  "name",
  "price",
  "description",
  "menu_category",
  "product_category",
  "product_type",
  "actual_name",
  "portfolio",
  "ingredient_1",
  "ingredient_1_quantity",
  "ingredient_2",
  "ingredient_2_quantity",
  "ingredient_3",
  "ingredient_3_quantity",
  "ingredient_4",
  "ingredient_4_quantity",
  "ingredient_5",
  "ingredient_5_quantity",
  "outlet_category",
  "maximum_sides",
  "preparation_time",
  "currency",
  "product_options",
  "product_image",
  "product_categories",
  "product_tag",
  "cuisine_type",
];

const desiredValues = (detail) => {
  return _.pick(
    detail,
    "id",
    "name",
    "price",
    "description",
    "menu_category",
    "product_category",
    "maximum_sides",
    "preparation_time",
    "product_categories",
    "product_tag",
    "cuisine_type",
    "is_published",
    "product_options",
    "currency"
  );
};
const appendProductDetails = (menu) => {
  return _.map(menu, (product) => {
    return {
      ...product,
      product_categories: _.map(product.product_categories, (item) => {
        return {
          name: item.category_detail.name,
          id: item.category_detail.id,
        };
      }),
      product_tag: _.map(product.product_tag, (item) => {
        return {
          name: item.tag_detail.name,
          id: item.tag_detail.id,
        };
      }),
      cuisine_type: _.map(product.cuisine_type, (item) => {
        return {
          name: item.cuisine_detail.name,
          id: item.cuisine_detail.id,
        };
      }),
      free_sides: _.map(product.free_sides, (item) => {
        return desiredValues(item.side_detail);
      }),
      paid_sides: _.map(product.paid_sides, (item) => {
        return desiredValues(item.side_detail);
      }),
    };
  });
};

module.exports = {
  desiredValues,
  appendProductDetails,
  outletMenueKeys,
};
