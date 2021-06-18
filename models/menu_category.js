import Model from "./model";
import models from "../models";

export default class MenuCategory extends Model {
  static get tableName() {
    return "menu_category";
  }
  static get relationMappings() {
    return {
      menu_category_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.ProductMenuCategory,
        join: {
          from: "menu_category.menu_category",
          to: "product_menu_category.id",
        },
      },
    };
  }
}
