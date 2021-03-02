import Model from "./model";
import models from "../models";

export default class Discount extends Model {
  static get tableName() {
    return "discounts";
  }
}
