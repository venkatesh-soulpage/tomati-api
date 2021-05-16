import Model from "./model";
import models from "../models";

export default class MenuProductCategory extends Model {
  static get tableName() {
    return "menu_product_categories";
  }
}
