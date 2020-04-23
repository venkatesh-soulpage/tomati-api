import Model from './model';
import models from '../models'

export default class Client extends Model {
    static get tableName () {
      return 'clients'
    }
  
    static get relationMappings () {
      return {
        owner: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Client,
          join: {
            from: 'clients.owner_id',
            to: 'accounts.id'
          }
        },
        location: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Location,
            join: {
              from: 'clients.location_id',
              to: 'locations.id'
            }
        },
        client_collaborators: {
          relation: Model.HasManyRelation,
          modelClass: models.ClientCollaborator,
          join: {
            from: 'clients.id',
            to: 'client_collaborators.client_id'
          }
        },
        venues: {
          relation: Model.HasManyRelation,
          modelClass: models.Venue,
          join: {
            from: 'clients.id',
            to: 'venues.created_by'
          }
        },
        brands: {
          relation: Model.HasManyRelation,
          modelClass: models.Brand,
          join: {
            from: 'clients.id',
            to: 'brands.client_id'
          }
        },
        products: {
          relation: Model.HasManyRelation,
          modelClass: models.Product,
          join: {
              from: 'clients.id',
              to: 'products.client_id'
          }
        },
        locations: {
          relation: Model.HasManyRelation,
          modelClass: models.ClientLocations,
          join: {
            from: 'clients.id',
            to: 'client_locations.client_id'
          }
        },
      }
    }
  }