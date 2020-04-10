import Model from './model';
import models from '.'

export default class AgencyCollaborator extends Model {
    static get tableName () {
      return 'agency_collaborators'
    }
  
    static get relationMappings () {
      return {
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Role,
          join: {
            from: 'agency_collaborators.role_id',
            to: 'roles.id'
          }
        },
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
              from: 'agency_collaborators.account_id',
              to: 'accounts.id'
            }
        },
        agency: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'agency_collaborators.agency_id',
              to: 'agencies.id'
            }
        },
      }
    }
  }