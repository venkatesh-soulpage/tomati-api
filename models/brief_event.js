import Model from './model';
import models from '.'

export default class BriefEvent extends Model {
    static get tableName () {
      return 'brief_events'
    }
  
    static get relationMappings () {
      return {
        brief: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Brief,
          join: {
            from: 'brief_events.brief_id',
            to: 'briefs.id'
          }
        },
        parent_brief_event: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.BriefEvent,
            join: {
              from: 'brief_events.parent_brief_event_id',
              to: 'brief_events.id'
            }
        },
        venue: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Venue,
            join: {
              from: 'brief_events.venue_id',
              to: 'venues.id'
            }
        },
        orders: {
          relation: Model.HasManyRelation,
          modelClass: models.RequisitionOrder,
          join: {
            from: 'brief_events.id',
            to: 'requisition_orders.brief_event_id',
          }
        },
        event: {
          relation: Model.HasOneRelation,
          modelClass: models.Event,
          join: {
            from: 'brief_events.id',
            to: 'events.brief_event_id'
          }
        }
      }
    }
  }