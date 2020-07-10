import Model from './model';
import models from '../models'

export default class EventCondition extends Model {
    static get tableName () {
      return 'event_free_drinks_conditions'
    }
  
    static get relationMappings () {
      return {
        event: {
          relation: Model.HasOneRelation,
          modelClass: models.Event,
          join: {
            from: 'event_free_drinks_conditions.event_id',
            to: 'events.id'
          }
        },
        role: {
          relation: Model.HasOneRelation,
          modelClass: models.Role,
          join: {
            from: 'event_free_drinks_conditions.role_id',
            to: 'roles.id'
          }
        },
      }
    }
  }