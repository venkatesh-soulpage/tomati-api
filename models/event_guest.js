import Model from './model';
import models from '../models'

export default class EventGuest extends Model {
    static get tableName () {
      return 'event_guests'
    }
  
    static get relationMappings () {
      return {
        event: {
          relation: Model.HasManyRelation,
          modelClass: models.Event,
          join: {
            from: 'event_guests.event_id',
            to: 'events.id'
          }
        },
      }
    }
  }