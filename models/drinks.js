import Model from "./model";
import models from "../models";

export default class Drinks extends Model {
  static get tableName() {
    return "drinks";
  }
}
