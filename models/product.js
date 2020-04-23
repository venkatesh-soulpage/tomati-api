import Model from './model';
import models from '../models'

export default class Product extends Model {
    static get tableName () {
      return 'products'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Client,
            join: {
                from: 'products.brand_id',
                through: {
                    from: 'brands.id',
                    to: 'brands.client_id'
                },
                to: 'clients.id'
            }
        },
        brand: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Brand,
          join: {
            from: 'products.brand_id',
            to: 'brands.id'
          }
        },
        ingredients: {
          relation: Model.HasManyRelation,
          modelClass: models.ProductIngredient,
          join: {
            from: 'products.id',
            to: 'product_ingredients.product_id'
          }
        },

      }
    }
  }