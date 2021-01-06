import Model from "./model";
import models from ".";

export default class OrderInfo extends Model {
  static get tableName() {
    return "ordersinfo";
  }

  static get relationMappings() {
    return {
      ordered_venue_product_id: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletVenueMenu,
        join: {
          from: "ordersinfo.outletvenuemenu_id",
          to: "outletvenuemenus.id",
        },
      },
      ordered_event_product_id: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletEventMenu,
        join: {
          from: "ordersinfo.outleteventmenu_id",
          to: "outleteventmenus.id",
        },
      },
    };
  }
}
