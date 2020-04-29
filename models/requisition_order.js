import Model from './model';
import models from '../models'

export default class RequisitionOrder extends Model {
    static get tableName () {
      return 'requisition_orders'
    }
  
    static get relationMappings () {
      return {
        requisition: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Requisition,
            join: {
              from: 'requisition_orders.requisition_id',
              to: 'requisitions.id'
            }
        },
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Product,
            join: {
              from: 'requisition_orders.product_id',
              to: 'products.id'
            }
        },
      }
    }
  }