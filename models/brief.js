import Model from './model';
import models from '../models'

export default class Brief extends Model {
    static get tableName () {
      return 'briefs'
    }
  
    static get relationMappings () {
      return {
        client_collaborator: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.ClientCollaborator,
            join: {
              from: 'briefs.created_by',
              to: 'client_collaborators.id'
            }
        },
        agency: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Agency,
            join: {
              from: 'briefs.agency_id',
              to: 'agencies.id'
            }
        },
        brief_events: {
          relation: Model.HasManyRelation,
          modelClass: models.BriefEvent,
          join: {
            from: 'briefs.id',
            to: 'brief_events.brief_id',
          }
        }
      }
    }
  }