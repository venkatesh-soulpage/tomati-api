import Model from './model';
import models from '.'

export default class BriefProducts extends Model {
    static get tableName () {
      return 'brief_products'
    }
  
    static get relationMappings () {
      return {
        brief: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Brief,
          join: {
            from: 'brief_products.brief_id',
            to: 'briefs.id'
          }
        },
      }
    }
  }