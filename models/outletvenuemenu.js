import Model from "./model";
import models from "../models";

export default class OutletVenueMenu extends Model {
  static get tableName() {
    return "outletvenuemenus";
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
      sides: {
        relation: Model.HasManyRelation,
        modelClass: models.MenuProductSides,
        join: {
          from: "menu_product_sides.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
