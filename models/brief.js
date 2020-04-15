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
      }
    }
  }