import Model from "./model";
import models from "../models";

export default class ProductMenuCategory extends Model {
  static get tableName() {
    return "product_menu_category";
  }
  static get relationMappings() {
    return {
      outlet_venue: {
        relation: Model.HasOneRelation,
        modelClass: models.OutletVenue,
        join: {
          from: "outletvenues.id",
          to: "product_menu_category.outlet_venue_id",
        },
      },
    };
  }
}
