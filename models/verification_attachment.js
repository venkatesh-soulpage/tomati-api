import Model from './model';
import models from '.'

export default class VerificationAttachment extends Model {
    static get tableName () {
      return 'verification_attachments'
    }
  
    static get relationMappings () {
      return {
        account: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Account,
          join: {
            from: 'verification_attachments.account_id',
            to: 'verification_attachments.id'
          }
        },
      }
    }
  }