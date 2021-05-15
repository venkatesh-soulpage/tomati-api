import Model from "./model";
import models from "../models";

export default class OutletVenueMenu extends Model {
  static get tableName() {
    return "outletvenuemenus";
  }
  static get relationMappings() {
    return {
      product_category: {
        relation: Model.HasManyRelation,
        modelClass: models.MenueProductCategory,
        join: {
          from: "menue_product_category.menue_product_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
