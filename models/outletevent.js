import Model from "./model";
import models from "../models";

export default class OutletEvent extends Model {
  static get tableName() {
    return "outletevents";
  }

  static get relationMappings() {
    return {
      menu: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletEventMenu,
        join: {
          from: "outleteventmenus.outlet_event_id",
          to: "outletevents.id",
        },
      },
      location: {
        relation: Model.HasOneRelation,
        modelClass: models.Location,
        join: {
          from: "locations.id",
          to: "outletevents.location_id",
        },
      },
    };
  }
}
