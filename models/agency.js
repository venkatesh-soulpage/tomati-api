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
        client: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Client,
          join: {
            from: 'agencies.invited_by',
            to: 'clients.id'
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
        agency_collaborators: {
          relation: Model.HasManyRelation,
          modelClass: models.AgencyCollaborator,
          join: {
            from: 'agencies.id',
            to: 'agency_collaborators.agency_id'
          }
        },
        briefs: {
          relation: Model.HasManyRelation,
          modelClass: models.Brief,
          join: {
            from: 'agencies.id',
            to: 'briefs.agency_id'
          }
        }
      }
    }
  }