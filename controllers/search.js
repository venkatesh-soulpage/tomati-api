import models from "../models";

import _ from "lodash";

//Tomati controllers
function arrayContainsArray(superset, subset) {
  return subset.every(function (value) {
    return superset.indexOf(value) >= 0;
  });
}
const search = async (req, res) => {
  try {
    let {
      keyword,
      product_categories,
      product_tags,
      product_cuisine_types,
      search_venues,
      min_price,
      max_price,
    } = req.body;
    let venues = await models.OutletVenue.query().orWhere(
      "name",
      "ilike",
      `%${keyword}%`
    );
    let dishes = await models.OutletVenueMenu.query()
      .withGraphFetched(`[product_categories,product_tag,cuisine_type]`)
      .where("name", "ilike", `%${keyword}%`)
      .orderBy("id", "asc");
    dishes = _.map(dishes, (dish) => {
      return {
        ...dish,
        product_categories: _.map(
          dish.product_categories,
          "menu_product_category"
        ),
        product_tag: _.map(dish.product_tag, "menu_product_tags"),
        cuisine_type: _.map(dish.cuisine_type, "menu_cuisine_type"),
      };
    });
    if (product_categories.length > 0) {
      dishes = _.filter(dishes, (dish) => {
        if (
          _.intersection(product_categories, dish.product_categories).length > 0
        )
          return dish;
      });
    }
    if (product_tags.length > 0) {
      dishes = _.filter(dishes, (dish) => {
        return arrayContainsArray(dish.product_tag, product_tags);
      });
    }
    if (product_cuisine_types.length > 0) {
      dishes = _.filter(dishes, (dish) => {
        if (_.intersection(product_cuisine_types, dish.cuisine_type).length > 0)
          return dish;
      });
    }
    if (search_venues.length > 0) {
      dishes = _.filter(dishes, (dish) => {
        return search_venues.includes(dish.outlet_venue_id);
      });

      const venueIds = _.map(
        _.unionBy(dishes, "outlet_venue_id"),
        "outlet_venue_id"
      );
      venues = _.filter(venues, (venue) => {
        return venueIds.includes(venue.id);
      });
    }
    return res.status(200).json({ venues, dishes });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const SearchController = {
  search,
};

export default SearchController;
