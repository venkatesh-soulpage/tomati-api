import Model from "./model";
import models from "../models";

export default class OutletWaiter extends Model {
  static get tableName() {
    return "outlet_waiters";
  }
}
