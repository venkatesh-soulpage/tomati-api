import Model from './model';
import models from '../models';

export default class Location extends Model {
    static get tableName () {
      return 'locations'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.HasManyRelation,
          modelClass: models.Account,
          join: {
            from: 'locations.id',
            to: 'accounts.location_id'
          }
        },
        parent: {
          relation: Model.HasOneRelation,
          modelClass: models.Location,
          join: {
            from: 'locations.parent_location',
            to: 'locations.id'
          }
        }
      }
    }
  }