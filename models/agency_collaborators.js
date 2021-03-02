import Model from './model';
import models from '.'

export default class AgencyCollaborator extends Model {
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
        agency: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Agency,
            join: {
              from: 'collaborators.agency_id',
              to: 'agencies.id'
            }
        },
        client: {
          relation: Model.HasOneThroughRelation,
          modelClass: models.Client,
          join: {
            from: 'collaborators.agency_id',
            through: {
              from :'agencies.id',
              to: 'agencies.invited_by',
            },
            to: 'clients.id'
          }
        }
      }
    }
  }