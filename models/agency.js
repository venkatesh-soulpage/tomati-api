import Model from './model';
import models from '../models'

export default class Agency extends Model {
    static get tableName () {
      return 'agencies'
    }
  
    static get relationMappings () {
      return {
        owner: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Account,
          join: {
            from: 'agencies.owner_id',
            to: 'accounts.id'
          }
        },
        location: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Location,
            join: {
              from: 'agencies.location_id',
              to: 'locations.id'
            }
        },
        /*agency_collaborators: {
          relation: Model.HasManyRelation,
          modelClass: models.ClientCollaborator,
          join: {
            from: 'clients.id',
            to: 'client_collaborators.client_id'
          }
        }*/
      }
    }
  }