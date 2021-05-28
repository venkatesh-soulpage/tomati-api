import Model from "./model";
import models from "../models";
export default class MenuProductPaidSides extends Model {
  static get tableName() {
    return "menu_product_paid_sides";
  }
  static get relationMappings() {
    return {
      side_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.OutletVenueMenu,
        join: {
          from: "menu_product_paid_sides.product_side_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
