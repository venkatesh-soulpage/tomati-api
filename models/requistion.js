import Model from './model';
import models from '../models'

export default class Requisition extends Model {
    static get tableName () {
      return 'requisitions'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Client,  
            join: {
                from: 'requisitions.brief_id',
                through: {
                    from: 'briefs.id',
                    to: 'briefs.client_id'
                }, 
                to: 'clients.id'
          }
        },
        agency: {
          relation: Model.HasOneThroughRelation,
          modelClass: models.Agency,  
          join: {
              from: 'requisitions.brief_id',
              through: {
                  from: 'briefs.id',
                  to: 'briefs.agency_id'
              }, 
              to: 'agencies.id'
          }
        },
        brief: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Brief,
            join: {
              from: 'requisitions.brief_id',
              to: 'briefs.id'
            }
        },
        parent_requisition: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Requisition,
            join: {
              from: 'requisitions.parent_requisition_id',
              to: 'requisitions.id'
            }
        },
        orders: {
          relation: Model.HasManyRelation,
          modelClass: models.RequisitionOrder,
          join: {
            from: 'requisitions.id',
            to: 'requisition_orders.requisition_id',
          }
        },
        deliveries: {
          relation: Model.HasManyRelation,
          modelClass: models.RequisitionDelivery,
          join: {
            from: 'requisitions.id',
            to: 'requisition_deliveries.requisition_id',
          }
        },
        created_by_account: {
          relation: Model.HasOneThroughRelation,
          modelClass: models.Account,
          join: {
            from: 'requisitions.created_by',
            through: {
              from: 'agency_collaborators.id',
              to: 'agency_collaborators.account_id'
            },
            to: 'accounts.id'
          }
        }
      }
    }
  }