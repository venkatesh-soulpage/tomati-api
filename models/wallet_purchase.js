import Model from './model';
import models from '../models'

export default class WalletPurchase extends Model {
    static get tableName () {
      return 'wallet_purchases'
    }
  
    static get relationMappings () {
      return {
        wallet: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Wallet,
            join: {
              from: 'wallet_purchases.wallet_id',
              to: 'wallets.id'
            }
        },
        scanned_by_account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
              from: 'wallet_purchases.scanned_by',
              to: 'accounts.id'
            }
        },
        event: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Event,
            join: {
              from: 'wallet_purchases.event_id',
              to: 'events.id'
            }
        },
      }
    }
  }