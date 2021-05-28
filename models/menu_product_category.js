import Model from "./model";
import models from "../models";

export default class MenuProductCategory extends Model {
  static get tableName() {
    return "menu_product_categories";
  }
  static get relationMappings() {
    return {
      category_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.ProductCategory,
        join: {
          from: "menu_product_categories.menu_product_category",
          to: "product_categories.id",
        },
      },
    };
  }
}
