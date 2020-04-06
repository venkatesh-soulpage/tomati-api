import Model from './model';

export default class Account extends Model {
    static get tableName () {
      return 'accounts'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.BelongsToOneRelation,
          modelClass: Account,
          join: {
            from: 'accounts.location_id',
            to: 'locations.id'
          }
        }
      }
    }
  }