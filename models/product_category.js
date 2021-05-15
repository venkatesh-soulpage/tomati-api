import Model from "./model";
import models from "../models";

export default class ProductCategory extends Model {
  static get tableName() {
    return "product_categories";
  }
}
