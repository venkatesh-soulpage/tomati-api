import Model from './model';
import models from '../models'

export default class Warehouse extends Model {
    static get tableName () {
      return 'warehouses'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'warehouses.client_id',
              to: 'clients.id'
            }
        },
        location: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Location,
          join: {
            from: 'warehouses.location_id',
            to: 'locations.id'
          }
        },
        stocks: {
          relation: Model.HasManyRelation,
          modelClass: models.WarehouseStock,
          join: {
            from: 'warehouses.id',
            to: 'warehouse_stocks.warehouse_id'
          }
        },
      }
    }
  }