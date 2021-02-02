import Model from "./model";
import models from "../models";

export default class Account extends Model {
  static get tableName() {
    return "accounts";
  }

  static get relationMappings() {
    return {
      role: {
        relation: Model.HasOneThroughRelation,
        modelClass: models.Role,
        join: {
          from: "accounts.id",
          through: {
            from: "collaborators.account_id",
            to: "collaborators.role_id",
          },
          to: "roles.id",
        },
      },
      collaborator: {
        relation: Model.HasOneRelation,
        modelClass: models.Collaborator,
        join: {
          from: "accounts.id",
          to: "collaborators.account_id",
        },
      },
      location: {
        relation: Model.BelongsToOneRelation,
        modelClass: models.Location,
        join: {
          from: "accounts.location_id",
          to: "locations.id",
        },
      },
      agencies: {
        relation: Model.HasManyRelation,
        modelClass: models.Agency,
        join: {
          from: "accounts.id",
          to: "agencies.owner_id",
        },
      },
      transactions: {
        relation: Model.HasManyRelation,
        modelClass: models.WarehouseTransaction,
        join: {
          from: "account.id",
          to: "warehouse_transactions.account_id",
        },
      },
      verifications: {
        relation: Model.HasManyRelation,
        modelClass: models.VerificationAttachment,
        join: {
          from: "accounts.id",
          to: "verification_attachments.account_id",
        },
      },
      wallet: {
        relation: Model.HasOneRelation,
        modelClass: models.Wallet,
        join: {
          from: "accounts.id",
          to: "wallets.account_id",
        },
      },
      events_guest: {
        relation: Model.HasManyRelation,
        modelClass: models.EventGuest,
        join: {
          from: "accounts.id",
          to: "event_guests.account_id",
        },
      },
      plan: {
        relation: Model.HasManyRelation,
        modelClass: models.Plan,
        join: {
          from: "accounts.plan_id",
          to: "plans.id",
        },
      },
    };
  }
}
