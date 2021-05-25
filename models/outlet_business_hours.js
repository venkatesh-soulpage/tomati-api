import Model from "./model";
import models from "../models";

export default class OutletBusinessHours extends Model {
  static get tableName() {
    return "outlet_business_hours";
  }
}
