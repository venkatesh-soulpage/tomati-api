import Model from './model';
import models from '../models'

export default class RequisitionEvent extends Model {
    static get tableName () {
      return 'requisition_events'
    }
  
    static get relationMappings () {
      return {
        requisition: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Brief,
            join: {
              from: 'requisition_orders.requisition_event_id',
              through: {
                from: 'requisition_events.id',
                to: 'requisition_events.requisition_id'
              },
              to: 'requisitions.id'
            }
        },
        requisition_event: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.RequisitionEvent,
            join: {
                from: 'requisition_orders.requisition_event_id',
                to: 'requisition_events.id'
            }
        },
        brief_product: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.BriefProducts,
            join: {
              from: 'requisition_orders.brief_product_id',
              to: 'brief_products.id'
            }
        },
      }
    }
  }