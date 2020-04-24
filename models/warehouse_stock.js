import Model from './model';
import models from '../models'

export default class WarehouseStock extends Model {
    static get tableName () {
      return 'warehouse_stocks'
    }
  
    static get relationMappings () {
      return {
        warehouse: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Warehouse,
          join: {
            from: 'warehouse_stocks.warehouse_id',
            to: 'warehouses.id'
          }
        },
        product: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Product,
          join: {
            from: 'warehouse_stocks.product_id',
            to: 'products.id'
          }
        },
        transactions: {
            relation: Model.HasManyRelation,
            modelClass: models.WarehouseTransaction,
            join: {
                from: 'warehouse_stocks.product_id',
                to: 'warehouse_transacions.product_id'
            }
        }
      }
    }
  }