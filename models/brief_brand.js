import Model from './model';
import models from '.'

export default class BriefBrand extends Model {
    static get tableName () {
      return 'brief_brands'
    }
  
    static get relationMappings () {
      return {
        brief: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Brief,
          join: {
            from: 'brief_brands.brief_id',
            to: 'briefs.id'
          }
        },
        brand: {
            relation: Model.HasOneRelation,
            modelClass: models.Brand,
            join: {
                from: 'brief_brands.brand_id',
                to: 'brands.id'
            }
        }
      }
    }
  }