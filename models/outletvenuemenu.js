import Model from "./model";
import models from "../models";

export default class OutletVenueMenu extends Model {
  static get tableName() {
    return "outletvenuemenus";
  }
  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        product_options: {
          type: "array",
          items: { type: "object" },
        },
      },
    };
  }
  static get relationMappings() {
    return {
      product_categories: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuProductCategory,
        join: {
          from: "menu_product_categories.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      product_tag: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuProductTags,
        join: {
          from: "menu_product_tags.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      cuisine_type: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuCuisineType,
        join: {
          from: "menu_cuisine_type.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      drinks: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuDrinks,
        join: {
          from: "menu_drinks.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      free_sides: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuProductFreeSides,
        join: {
          from: "menu_product_free_sides.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      paid_sides: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuProductPaidSides,
        join: {
          from: "menu_product_paid_sides.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
      outlet_venue: {
        relation: Model.HasOneRelation,
        modelClass: models.OutletVenue,
        join: {
          from: "outletvenues.id",
          to: "outletvenuemenus.outlet_venue_id",
        },
      },
      menu_categories: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuCategory,
        join: {
          from: "menu_category.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
