import Model from './model';
import models from '../models'

export default class RegionalOrganizationLocation extends Model {
    static get tableName () {
      return 'regional_organization_locations'
    }
  
    static get relationMappings () {
      return {
        regional_organization: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.RegionalOrganization,
            join: {
              from: 'regional_organization_locations.regional_location_id',
              to: 'regional_organizations.id'
            }
        },
        location: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Location,
            join: {
              from: 'regional_organization_locations.location_id',
              to: 'locations.id'
            }
        },
      }
    }
  }