import Model from './model';
import models from '../models'

export default class RequisitionDeliveryProduct extends Model {
    static get tableName () {
      return 'requisition_delivery_products'
    }
  
    static get relationMappings () {
      return {
        requisition_delivery: {
            relation: Model.HasOneRelation,
            modelClass: models.RequisitionDelivery,
            join: {
              from: 'requisition_delivery_products.requisition_delivery_id',
              to: 'requisition_deliveries.id'
            }
        },
        order: {
            relation: Model.HasOneRelation,
            modelClass: models.RequisitionOrder,
            join: {
              from: 'requisition_delivery_products.requisition_order_id',
              to: 'requisition_orders.id'
            }
        },
        product: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Product,
            join: {
              from: 'requisition_delivery_products.requisition_order_id',
              through: {
                from: 'requisition_orders.id',
                to: 'requisition_orders.product_id'
              },
              to: 'products.id'
            }
        }
      }
    }
  }