import Model from "./model";
import models from "../models";

export default class OutletVenue extends Model {
  static get tableName() {
    return "outletvenues";
  }
  static get relationMappings() {
    return {
      menu: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletVenueMenu,
        join: {
          from: "outletvenuemenus.outlet_venue_id",
          to: "outletvenues.id",
        },
      },
      location: {
        relation: Model.HasOneRelation,
        modelClass: models.Location,
        join: {
          from: "locations.id",
          to: "outletvenues.location_id",
        },
      },
    };
  }
}
