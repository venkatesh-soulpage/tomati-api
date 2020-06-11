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
      }
    }
  }