import Model from "./model";
import models from "../models";

export default class MenuProductTags extends Model {
  static get tableName() {
    return "menu_product_tags";
  }
  static get relationMappings() {
    return {
      tag_detail: {
        relation: Model.HasOneRelation,
        modelClass: models.ProductTags,
        join: {
          from: "menu_product_tags.menu_product_tags",
          to: "product_tags.id",
        },
      },
    };
  }
}
