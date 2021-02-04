import Model from "./model";
import models from "../models";

export default class tempOutletRegistrations extends Model {
  static get tableName() {
    return "temp_outlet_registrations";
  }
  static get relationMappings() {
    return {
      map_plan: {
        relation: Model.HasManyRelation,
        modelClass: models.Plan,
        join: {
          from: "temp_outlet_registrations.plan",
          to: "plans.id",
        },
      },
    };
  }
}
