import Model from "./model";
import models from ".";

export default class Statistics extends Model {
  static get tableName() {
    return "statistics";
  }

  static get relationMappings() {
    return {
      venue_id: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletVenue,
        join: {
          from: "statistics.outletvenue_id",
          to: "outletvenues.id",
        },
      },
      event_id: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletEvent,
        join: {
          from: "statistics.outletevent_id",
          to: "outletevents.id",
        },
      },
    };
  }
}
