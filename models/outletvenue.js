import Model from "./model";
import models from "../models";

export default class OutletVenue extends Model {
  static get tableName() {
    return "outletvenues";
  }

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        delivery_options: {
          type: "array",
          items: { type: "object" },
        },
      },
    };
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
      collaborators: {
        relation: Model.HasManyRelation,
        modelClass: models.CollaboratorInvitation,
        join: {
          from: "collaborator_invitations.venue_id",
          to: "outletvenues.id",
        },
      },
      business_hours: {
        relation: Model.HasManyRelation,
        modelClass: models.OutletBusinessHours,
        join: {
          from: "outlet_business_hours.outlet_venue_id",
          to: "outletvenues.id",
        },
      },
    };
  }
}
