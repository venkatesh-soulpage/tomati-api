import Model from './model';
import models from '../models'

export default class TransferLog extends Model {
    static get tableName () {
      return 'transfer_logs'
    }
  
    static get relationMappings () {
      return {
        source_account: {
            relation: Model.HasOneRelation,
            modelClass: models.Account,  
            join: {
                from: 'transfer_logs.from_account_id',
                to: 'accounts.id'
          }
        },
        target_account: {
            relation: Model.HasOneRelation,
            modelClass: models.Account,  
            join: {
                from: 'transfer_logs.to_account_id',
                to: 'accounts.id'
          }
        },
      }
    }
  }