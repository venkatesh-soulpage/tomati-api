import Model from './model';
import models from '../models'

export default class ProductIngredients extends Model {
    static get tableName () {
      return 'product_ingredients'
    }
  
    static get relationMappings () {
      return {
        product_parent: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Product,
          join: {
            from: 'product_ingredients.product_parent_id',
            to: 'products.id'
          }
        },
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Product,
            join: {
              from: 'product_ingredients.product_id',
              to: 'products.id'
            }
        },

      }
    }
  }