import Model from './model';
import models from '../models'

export default class CollaboratorInvitation extends Model {
    static get tableName () {
      return 'collaborator_invitations'
    }
  
    static get relationMappings () {
      return {
        organization: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.RegionalOrganization,
          join: {
            from: 'collaborator_invitations.regional_organization_id',
            to: 'regional_organizations.id'
          },
        }, 
        client: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Client,
          join: {
            from: 'collaborator_invitations.client_id',
            to: 'clients.id'
          }
        },
        agency: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Agency,
          join: {
            from: 'collaborator_invitations.agency_id',
            to: 'agencies.id'
          }
        },
        role: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Role,
          join: {
            from: 'collaborator_invitations.role_id',
            to: 'roles.id'
          }
        },
      }
    }
  }