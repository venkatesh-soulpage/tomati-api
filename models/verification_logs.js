import Model from './model';
import models from '.'

export default class VerificationLogs extends Model {
    static get tableName () {
      return 'verification_logs'
    }
  
    static get relationMappings () {
      return {
        verified_by_account: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Account,
          join: {
            from: 'verification_logs.verify_by',
            to: 'accounts.id'
          }
        },
        account: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Account,
          join: {
            from: 'verification_logs.account_id',
            to: 'accounts.id'
          }
        },
        client: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Client,
          join: {
            from: 'verification_logs.client_id',
            to: 'clients.id'
          }
        },
        organization: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.RegionalOrganization,
          join: {
            from: 'verification_logs.regional_organization_id',
            to: 'regional_organizations.id'
          }
        },
      }
    }
  }