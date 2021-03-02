import Model from './model';
import models from '.'

export default class WalletOrder extends Model {
    static get tableName () {
      return 'wallet_orders'
    }
  
    static get relationMappings () {
      return {
        wallet: {
          relation: Model.HasOneRelation,
          modelClass: models.Wallet,
          join: {
            from: 'wallet_orders.wallet_id',
            to: 'wallets.id'
          }
        },
        event: {
          relation: Model.HasOneRelation,
          modelClass: models.Event,
          join: {
            from: 'wallet_orders.event_id',
            to: 'events.id'
          }
        },
        transactions: {
            relation: Model.HasManyRelation,
            modelClass: models.WalletOrderTransaction,
            join: {
                from: 'wallet_orders.id',
                to: 'wallet_order_transactions.wallet_order_id'
            }
        },
        agency_collaborator: {
          relation: Model.HasOneRelation, 
          modelClass: models.Account,
          join: {
            from: 'wallet_orders.scanned_by',
            to: 'accounts.id'
          }
        }
      }
    }
  }