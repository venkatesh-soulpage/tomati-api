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
            from: 'wallet_orders.wallet_id',
            to: 'wallets.id'
          }
        },
        event_product: {
            relation: Model.HasOneRelation,
            modelClass: models.EventProduct,
            join: {
                from: 'wallet_orders.event_product_id',
                to: 'event_products.id'
            }
        }
      }
    }
  }