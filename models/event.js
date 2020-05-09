import Model from './model';
import models from '../models'

export default class Event extends Model {
    static get tableName () {
      return 'events'
    }
  
    static get relationMappings () {
      return {
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
        }
      }
    }
  }