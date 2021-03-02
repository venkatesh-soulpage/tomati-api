import Model from './model';
import models from '../models'

export default class Collaborator extends Model {
    static get tableName () {
      return 'collaborators'
    }
  
    static get relationMappings () {
      return {
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
                from: 'collaborators.account_id',
                to: 'accounts.id'
            }
        },
        role: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Role,
            join: {
                from: 'collaborators.role_id',
                to: 'roles.id'
            }
        },
        organization: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.RegionalOrganization,
          join: {
            from: 'collaborators.regional_organization_id',
            to: 'regional_organizations.id'
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
        agency: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Agency,
          join: {
            from: 'collaborators.agency_id',
            to: 'agencies.id'
          }
        },
      }
    }
  }