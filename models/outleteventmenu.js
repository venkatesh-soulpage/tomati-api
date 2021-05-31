import Model from "./model";
import models from "../models";

export default class OutletEventMenu extends Model {
  static get tableName() {
    return "outleteventmenus";
  }
  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        product_options: {
          type: "array",
          items: { type: "object" },
        },
      },
    };
  }
}
