import Model from './model';
import models from '../models'

export default class EventProduct extends Model {
    static get tableName () {
      return 'event_products'
    }
  
    static get relationMappings () {
      return {
        event: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Event,
          join: {
            from: 'event_products.event_id',
            to: 'events.id'
          }
        },
        product: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Product,
          join: {
            from: 'event_products.product_id',
            to: 'products.id'
          }
        },
      }
    }
  }