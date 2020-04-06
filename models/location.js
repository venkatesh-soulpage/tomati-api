import Model from './model';

export default class Location extends Model {
    static get tableName () {
      return 'locations'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.HasManyRelation,
          modelClass: Account,
          join: {
            from: 'locations.id',
            to: 'accounts.location_id'
          }
        }
      }
    }
  }