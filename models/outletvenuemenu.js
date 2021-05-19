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
        modelClass: models.MenuProductCategory,
        join: {
          from: "menu_product_tags.menu_product_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
