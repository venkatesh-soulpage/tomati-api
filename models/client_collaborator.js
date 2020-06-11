import Model from './model';
import models from '../models'

export default class ClientCollaborator extends Model {
    static get tableName () {
      return 'collaborators'
    }
  
    static get relationMappings () {
      return {
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Role,
          join: {
            from: 'collaborators.role_id',
            to: 'roles.id'
          }
        },
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
              from: 'collaborators.account_id',
              to: 'accounts.id'
            }
        },
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'collaborators.client_id',
              to: 'clients.id'
            }
        },
        briefs: {
          relation: Model.HasManyRelation,
          modelClass: models.Briefs,
          join: {
            from: 'collaborators.id',
            to: 'briefs.created_by'
          }
        },
      }
    }
  }