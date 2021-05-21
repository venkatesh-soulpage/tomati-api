import Model from "./model";
import models from "../models";

export default class CuisineType extends Model {
  static get tableName() {
    return "cuisine_type";
  }
}
