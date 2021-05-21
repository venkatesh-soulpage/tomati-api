import Model from "./model";
import models from "../models";

export default class ProductTags extends Model {
  static get tableName() {
    return "product_tags";
  }
}
