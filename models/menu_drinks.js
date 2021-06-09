import Model from "./model";
import models from "../models";

export default class MenuDrinks extends Model {
  static get tableName() {
    return "menu_drinks";
  }
  static get relationMappings() {
    return {
      drinks_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.Drinks,
        join: {
          from: "menu_drinks.menu_drinks",
          to: "drinks.id",
        },
      },
    };
  }
}
