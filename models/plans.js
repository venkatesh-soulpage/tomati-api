import Model from "./model";
import models from "../models";

export default class Plan extends Model {
  static get tableName() {
    return "plans";
  }
}
