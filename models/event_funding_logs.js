import Model from './model';
import models from '../models'

export default class EventFundingLogs extends Model {
    static get tableName () {
      return 'event_funding_logs'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Account,
          join: {
            from: 'event_funding_logs.account_id',
            to: 'accounts.id'
          }
        },
        event: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Event,
            join: {
                from: 'event_funding_logs.event_id',
                to: 'events.id'
            }
        }
      }
    }
  }