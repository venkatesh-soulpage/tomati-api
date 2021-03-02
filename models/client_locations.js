import Model from './model';
import models from '../models'

export default class ClientLocation extends Model {
    static get tableName () {
      return 'client_locations'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'client_locations.client_id',
              to: 'clients.id'
            }
        },
        location: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Location,
            join: {
              from: 'client_locations.location_id',
              to: 'locations.id'
            }
        },
      }
    }
  }