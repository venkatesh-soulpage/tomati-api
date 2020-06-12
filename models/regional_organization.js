import Model from './model';
import models from '../models'

export default class RegionalOrganization extends Model {
    static get tableName () {
      return 'regional_organizations'
    }
  
    static get relationMappings () {
      return {
        clients: {
            relation: Model.HasManyRelation,
            modelClass: models.Client,
            join: {
                from: 'regional_organizations.id',
                to: 'clients.regional_organization_id'
            }
        },
        collaborators: {
          relation: Model.HasManyRelation,
          modelClass: models.Collaborator,
          join: {
            from: 'regional_organizations.id',
            to: 'collaborators.regional_organization_id',
          }
        },
        collaborator_invitations: {
          relation: Model.HasManyRelation,
          modelClass: models.CollaboratorInvitation,
          join: {
            from: 'regional_organizations.id',
            to: 'collaborator_invitations.regional_organization_id'
          }
        }, 
        locations: {
            relation: Model.HasManyRelation,
            modelClass: models.RegionalOrganizationLocation,
            join: {
                from: 'regional_organizations.id',
                to: 'regional_organization_locations.regional_organization_id'
            }
        },
      }
    }
  }