import Model from './model';
import models from '../models'

export default class Brand extends Model {
    static get tableName () {
      return 'brands'
    }
  
    static get relationMappings () {
      return {
        products: {
          relation: Model.HasManyRelation,
          modelClass: models.Products,
          join: {
            from: 'brands.id',
            to: 'products.brand_id'
          }
        },

      }
    }
  }