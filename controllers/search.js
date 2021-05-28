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
      minPrice,
      maxPrice,
    } = req.body;
    if (
      _.isEmpty(req.body) ||
      (!keyword &&
        !minPrice &&
        !maxPrice &&
        _.isEmpty(product_categories) &&
        _.isEmpty(product_tags) &&
        _.isEmpty(search_venues) &&
        _.isEmpty(product_cuisine_types))
    )
      return res.status(400).json("Please input keyword");
    let venuesWithKeyword = [];
    let venues = await models.OutletVenue.query().orderBy("id", "asc");
    let dishes = [];
    if (_.isNumber(minPrice) && _.isNumber(maxPrice)) {
      dishes = await models.OutletVenueMenu.query()
        .withGraphFetched(
          `[product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],free_sides.[side_detail],paid_sides.[side_detail]]`
        )
        .where("price", ">=", minPrice)
        .where("price", "<=", maxPrice)
        .orderBy("id", "asc");
    } else {
      dishes = await models.OutletVenueMenu.query()
        .withGraphFetched(
          `[product_categories.[category_detail],product_tag.[tag_detail],cuisine_type.[cuisine_detail],free_sides.[side_detail],paid_sides.[side_detail]]`
        )
        .orderBy("id", "asc");
    }

    dishes = _.map(dishes, (dish) => {
      return {
        ...dish,
        product_categories: _.map(dish.product_categories, (item) => {
          return {
            name: item.category_detail.name,
            id: item.category_detail.id,
          };
        }),
        product_tag: _.map(dish.product_tag, (item) => {
          return {
            name: item.tag_detail.name,
            id: item.tag_detail.id,
          };
        }),
        cuisine_type: _.map(dish.cuisine_type, (item) => {
          return {
            name: item.cuisine_detail.name,
            id: item.cuisine_detail.id,
          };
        }),
      };
    });
    if (keyword) {
      venuesWithKeyword = _.filter(venues, (venue) => {
        return _.includes(venue.name.toLowerCase(), keyword.toLowerCase());
      });
      dishes = _.filter(dishes, (dish) => {
        return _.includes(dish.name.toLowerCase(), keyword.toLowerCase());
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
    if (search_venues && !_.isEmpty(search_venues)) {
      dishes = _.filter(dishes, (dish) => {
        return _.includes(search_venues, dish.outlet_venue_id);
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
    dishes = _.map(dishes, (dish) => {
      return {
        ...dish,
        free_sides: _.map(dish.free_sides, (item) => {
          return {
            id: item.side_detail.id,
            name: item.side_detail.name,
            price: item.side_detail.price,
          };
        }),
        paid_sides: _.map(dish.paid_sides, (item) => {
          return {
            id: item.side_detail.id,
            name: item.side_detail.name,
            price: item.side_detail.price,
          };
        }),
        outlet_venue_name: _.find(venues, { id: dish.outlet_venue_id }).name,
        outlet_venue_address: _.find(venues, { id: dish.outlet_venue_id })
          .address,
        outlet_venue_latitude: _.find(venues, { id: dish.outlet_venue_id })
          .latitude,
        outlet_venue_longitude: _.find(venues, { id: dish.outlet_venue_id })
          .longitude,
      };
    });

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