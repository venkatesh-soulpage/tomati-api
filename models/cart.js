import Model from "./model";
import models from "../models";

export default class Cart extends Model {
  static get tableName() {
    return "carts";
  }

  static get relationMappings() {
    return {
      items: {
        relation: Model.HasManyRelation,
        modelClass: models.CartItem,
        join: {
          from: "cart_items.cart_id",
          to: "carts.id",
        },
      },
    };
  }
}
