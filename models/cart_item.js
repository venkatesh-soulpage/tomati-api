import Model from "./model";
import models from "../models";

export default class CartItem extends Model {
  static get tableName() {
    return "cart_items";
  }

  static get relationMappings() {
    return {
      eventproduct: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletEventMenu,
        join: {
          from: "cart_items.outleteventmenu_id",
          to: "outleteventmenus.id",
        },
      },
      venueproduct: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletVenueMenu,
        join: {
          from: "cart_items.outletvenuemenu_id",
          to: "outletvenuemenus.id",
        },
      },
    };
  }
}
