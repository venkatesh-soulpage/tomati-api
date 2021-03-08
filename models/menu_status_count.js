import Model from "./model";
import models from "../models";

export default class MenuStatusCount extends Model {
  static get tableName() {
    return "menu_status_count";
  }
  static get relationMappings() {
    return {
      account: {
        relation: Model.BelongsToOneRelation,
        modelClass: models.Account,
        join: {
          from: "menu_status_count.account_id",
          to: "accounts.id",
        },
      },
    };
  }
}
