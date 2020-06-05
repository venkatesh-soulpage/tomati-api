import Model from './model';
import models from '../models'

export default class WalletOrderTransaction extends Model {
    static get tableName () {
      return 'wallet_order_transactions'
    }
  
    static get relationMappings () {
      return {
        wallet_order: {
          relation: Model.HasOneRelation,
          modelClass: models.WalletOrder,
          join: {
            from: 'wallet_order_transactions.wallet_order_id',
            to: 'wallet_orders.id'
          }
        },
        event_product: {
            relation: Model.HasOneRelation,
            modelClass: models.EventProduct,
            join: {
                from: 'wallet_order_transactions.event_product_id',
                to: 'event_products.id'
            }
        }
      }
    }
  }