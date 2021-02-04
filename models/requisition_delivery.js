import Model from './model';
import models from '../models'

export default class RequisitionDelivery extends Model {
    static get tableName () {
      return 'requisition_deliveries'
    }
  
    static get relationMappings () {
      return {
        requisition: {
            relation: Model.HasOneRelation,
            modelClass: models.Requisition,
            join: {
              from: 'requisition_deliveries.requisition_id',
              to: 'requisitions.id'
            }
        },
        warehouse: {
            relation: Model.HasOneRelation,
            modelClass: models.Warehouse,
            join: {
              from: 'requisition_deliveries.warehouse_id',
              to: 'warehouses.id'
            }
        },
        products: {
            relation: Model.HasManyRelation,
            modelClass: models.RequisitionDeliveryProduct,
            join: {
                from: 'requisition_deliveries.id',
                to: 'requisition_delivery_products.requisition_delivery_id',
            }
        }
      }
    }
  }