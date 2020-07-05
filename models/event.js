import Model from './model';
import models from '../models'

export default class Event extends Model {
    static get tableName () {
      return 'events'
    }
  
    static get relationMappings () {
      return {
        brief: {
          relation: Model.HasOneThroughRelation,
          modelClass: models.Brief,
          join: {
            from: 'events.brief_event_id',
            through: {
              from: 'brief_events.id',
              to: 'brief_events.brief_id'
            }, 
            to: 'briefs.id'
          }
        },
        condition: {
          relation: Model.HasOneRelation,
          modelClass: models.EventCondition,
          join: {
            from: 'events.id',
            to: 'event_free_drinks_conditions.event_id'
          }
        },
        brief_event: {
          relation: Model.HasOneRelation,
          modelClass: models.BriefEvent,
          join: {
            from: 'events.brief_event_id',
            to: 'brief_events.id'
          }
        },
        guests: {
            relation: Model.HasManyRelation,
            modelClass: models.EventGuest,
            join: {
                from: 'events.id',
                to: 'event_guests.event_id'
            }
        },
        products: {
            relation: Model.HasManyRelation,
            modelClass: models.EventProduct,
            join: {
                from: 'events.id',
                to: 'event_products.event_id'
            }
        },
        purchases: {
          relation: Model.HasManyRelation,
          modelClass: models.WalletPurchase,
          join: {
            from: 'events.id',
            to: 'wallet_purchases.event_id'
          }
        }
      }
    }
  }