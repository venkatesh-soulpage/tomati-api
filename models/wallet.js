import Model from './model';
import models from '../models'

export default class Wallet extends Model {
    static get tableName () {
      return 'wallets'
    }
  
    static get relationMappings () {
      return {
        account: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Account,
            join: {
              from: 'wallets.account_id',
              to: 'accounts.id'
            }
        },
      }
    }
  }