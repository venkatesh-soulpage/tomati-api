import Model from './model';
import models from '../models'

export default class EventGuest extends Model {
    static get tableName () {
      return 'event_guests'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.HasOneRelation,
          modelClass: models.Account,
          join: {
            from: 'event_guests.account_id',
            to: 'accounts.id'
          }
        },
        checked_in_by_account: {
          relation: Model.HasOneRelation,
          modelClass: models.Account,
          join: {
            from: 'event_guests.checked_in_by',
            to: 'accounts.id'
          }
        },
        checked_out_by_account: {
          relation: Model.HasOneRelation,
          modelClass: models.Account,
          join: {
            from: 'event_guests.checked_out_by',
            to: 'accounts.id'
          }
        },
        event: {
          relation: Model.HasOneRelation,
          modelClass: models.Event,
          join: {
            from: 'event_guests.event_id',
            to: 'events.id'
          }
        },
        role: {
          relation: Model.HasOneRelation,
          modelClass: models.Role,
          join: {
            from: 'event_guests.role_id',
            to: 'roles.id'
          }
        },
      }
    }
  }