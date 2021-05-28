import _ from "lodash";

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
};
