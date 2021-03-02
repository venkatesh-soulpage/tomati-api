import Model from './model';
import models from '../models'

export default class Venue extends Model {
    static get tableName () {
      return 'venues'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'venues.created_by',
              to: 'clients.id'
            }
        },
        brief_events: {
          relation: Model.HasManyRelation,
          modelClass: models.BriefEvent,
          join: {
            from: 'venues.id',
            to: 'brief_events.venue_id'
          }
        },
        location: {
          relation: Model.HasOneRelation,
          modelClass: models.Location,
          join: {
            from: 'venues.location_id',
            to: 'locations.id'
          }
        }
      }
    }
  }