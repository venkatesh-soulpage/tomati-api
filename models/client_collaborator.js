import Model from './model';
import models from '../models'

export default class ClientCollaborator extends Model {
    static get tableName () {
      return 'client_collaborators'
    }
  
    static get relationMappings () {
      return {
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Role,
          join: {
            from: 'client_collaborators.role_id',
            to: 'roles.id'
          }
        },
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
              from: 'client_collaborators.account_id',
              to: 'accounts.id'
            }
        },
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'client_collaborators.client_id',
              to: 'clients.id'
            }
        },
      }
    }
  }