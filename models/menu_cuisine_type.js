import Model from "./model";
import models from "../models";

export default class MenuCuisineType extends Model {
  static get tableName() {
    return "menu_cuisine_type";
  }
  static get relationMappings() {
    return {
      cuisine_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.CuisineType,
        join: {
          from: "menu_cuisine_type.menu_cuisine_type",
          to: "cuisine_type.id",
        },
      },
    };
  }
}
