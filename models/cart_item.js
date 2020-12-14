import Model from "./model";
import models from "../models";

export default class CartItem extends Model {
  static get tableName() {
    return "cart_items";
  }
}
