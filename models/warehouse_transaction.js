import Model from './model';
import models from '.'

export default class WarehouseStock extends Model {
    static get tableName () {
      return 'warehouse_transactions'
    }
  
    static get relationMappings () {
      return {
        warehouse: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Warehouse,
          join: {
            from: 'warehouse_transactions.warehouse_id',
            to: 'warehouses.id'
          }
        },
        product: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Product,
          join: {
            from: 'warehouse_transactions.product_id',
            to: 'products.id'
          }
        },
        stock: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.WarehouseStock,
            join: {
                from: 'warehouse_transactions.product_id',
                to: 'warehouse_stock.product_id',
            }
        },
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
                from: 'warehouse_transactions.account_id',
                to: 'accounts.id',
            }
        }
      }
    }
  }