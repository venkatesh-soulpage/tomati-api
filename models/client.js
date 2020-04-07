import Model from './model';

export default class Client extends Model {
    static get tableName () {
      return 'clients'
    }
  
    static get relationMappings () {
      return {
        owner: {
          relation: Model.BelongsToOneRelation,
          modelClass: Account,
          join: {
            from: 'clients.owner_id',
            to: 'accounts.id'
          }
        },
        location: {
            relation: Model.BelongsToOneRelation,
            modelClass: Location,
            join: {
              from: 'clients.location_id',
              to: 'locations.id'
            }
        },
      }
    }
  }