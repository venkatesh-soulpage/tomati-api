import models from "../models";
const { appendProductDetails, distance } = require("../utils/commonFunctions");
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
      drinks,
      search_venues,
      minPrice,
      maxPrice,
      delivery_options,
      latitude,
      longitude,
      range,
    } = req.body;
    if (
      _.isEmpty(req.body) ||
      (!keyword &&
        !minPrice &&
        !maxPrice &&
        !latitude &&
        !longitude &&
        !range &&
        _.isEmpty(product_categories) &&
        _.isEmpty(product_tags) &&
        _.isEmpty(search_venues) &&
        _.isEmpty(delivery_options) &&
        _.isEmpty(drinks) &&
        _.isEmpty(product_cuisine_types))
    )
      return res.status(400).json("Please input keyword");
    if (
      delivery_options &&
      !_.isEmpty(delivery_options) &&
      delivery_options.length > 1
    ) {
      return res.status(400).json("Multiple Delivery Options are not accepted");
    }
    let venuesWithKeyword = [];
    let venues = await models.OutletVenue.query()
      .withGraphFetched(`[location]`)
      .orderBy("id", "asc");
    let dishes = [];
    if (_.isNumber(minPrice) && _.isNumber(maxPrice)) {
      dishes = await models.OutletVenueMenu.query()
        .withGraphFetched(
          `[outlet_venue.[location],product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],drinks.[drinks_detail],free_sides.[side_detail],paid_sides.[side_detail]]`
        )
        .where("price", ">=", minPrice)
        .where("price", "<=", maxPrice)
        .orderBy("id", "asc");
    } else {
      dishes = await models.OutletVenueMenu.query()
        .withGraphFetched(
          `[outlet_venue.[location],product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],drinks.[drinks_detail],free_sides.[side_detail],paid_sides.[side_detail]]`
        )
        .orderBy("id", "asc");
    }

    dishes = appendProductDetails(dishes);
    if (keyword) {
      venuesWithKeyword = _.filter(venues, (venue) => {
        return _.includes(venue.name.toLowerCase(), keyword.toLowerCase());
      });
      dishes = _.filter(dishes, (dish) => {
        return _.includes(dish.name.toLowerCase(), keyword.toLowerCase());
      });
    }
    const venueIds = _.map(
      _.unionBy(dishes, "outlet_venue_id"),
      "outlet_venue_id"
    );
    const venuesWithDishes = _.filter(venues, (venue) => {
      return _.includes(venueIds, venue.id);
    });
    venues = venuesWithKeyword;
    if (!_.isEmpty(venuesWithDishes)) {
      venues = _.unionBy(venuesWithKeyword, venuesWithDishes, "id");
    }
    if (search_venues && !_.isEmpty(search_venues)) {
      dishes = _.filter(dishes, (dish) => {
        return _.includes(search_venues, dish.outlet_venue_id);
      });
      venues = _.filter(venues, (venue) => {
        return _.includes(search_venues, venue.id);
      });
    }
    if (delivery_options && !_.isEmpty(delivery_options)) {
      venues = _.filter(venues, (venue) => {
        return !_.isEmpty(
          _.intersection(
            _.map(delivery_options, "option"),
            _.map(venue.delivery_options, "option")
          )
        );
      });
      dishes = _.filter(dishes, (dish) => {
        return !_.isEmpty(
          _.intersection(
            _.map(delivery_options, "option"),
            _.map(dish.outlet_venue.delivery_options, "option")
          )
        );
      });
    }
    if (latitude && longitude && range) {
      venues = _.filter(venues, (venue) => {
        venue.distance = distance(
          venue.latitude,
          venue.longitude,
          latitude,
          longitude
        );
        return range - venue.distance >= 0;
      });
      dishes = _.filter(dishes, (dish) => {
        dish.outlet_venue.distance = distance(
          dish.outlet_venue.latitude,
          dish.outlet_venue.longitude,
          latitude,
          longitude
        );
        return range - dish.outlet_venue.distance >= 0;
      });
    }

    if (product_categories && !_.isEmpty(product_categories)) {
      dishes = _.filter(dishes, (dish) => {
        return !_.isEmpty(
          _.intersection(
            product_categories,
            _.map(dish.product_categories, "id")
          )
        );
      });
    }
    if (product_tags && !_.isEmpty(product_tags)) {
      dishes = _.filter(dishes, (dish) => {
        return arrayContainsArray(_.map(dish.product_tag, "id"), product_tags);
      });
    }
    if (product_cuisine_types && !_.isEmpty(product_cuisine_types)) {
      dishes = _.filter(dishes, (dish) => {
        return !_.isEmpty(
          _.intersection(product_cuisine_types, _.map(dish.cuisine_type, "id"))
        );
      });
    }
    if (drinks && !_.isEmpty(drinks)) {
      dishes = _.filter(dishes, (dish) => {
        return !_.isEmpty(_.intersection(drinks, _.map(dish.drinks, "id")));
      });
    }

    _.forEach(venues, (v) => delete v.stats);

    if (req.originalUrl === "/api/search/count") {
      return res.status(200).json({
        venues_count: venues.length,
        dishes_count: dishes.length,
      });
    }
    return res.status(200).json({
      venues,
      dishes,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json(JSON.stringify(e));
  }
};

const SearchController = {
  search,
};
export default SearchController;
