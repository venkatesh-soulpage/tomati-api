import Model from "./model";
import models from ".";
export default class MenuProductFreeSides extends Model {
  static get tableName() {
    return "menu_product_free_sides";
  }
  static get relationMappings() {
    return {
      side_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.OutletVenueMenu,
        join: {
          from: "menu_product_free_sides.product_side_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
