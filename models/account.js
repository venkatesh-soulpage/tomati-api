import Model from './model';
import models from '../models'

export default class Account extends Model {
    static get tableName () {
      return 'accounts'
    }
  
    static get relationMappings () {
      return {
        location: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Location,
          join: {
            from: 'accounts.location_id',
            to: 'locations.id'
          }
        },
        agencies: {
          relation: Model.HasManyRelation,
          modelClass: models.Agency,
          join: {
            from: 'accounts.id',
            to: 'agencies.owner_id'
          }
        },

      }
    }
  }