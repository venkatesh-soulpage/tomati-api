import Model from './model';
import models from '../models'

export default class Requisition extends Model {
    static get tableName () {
      return 'briefs'
    }
  
    static get relationMappings () {
      return {
        brief: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Brief,
            join: {
              from: 'requisitions.brief_id',
              to: 'briefs.id'
            }
        },
        parent_requisition: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Requisition,
            join: {
              from: 'requisitions.parent_requisition_id',
              to: 'requisitions.id'
            }
        },
        products: {
          relation: Model.HasManyRelation,
          modelClass: models.RequisitionEvent,
          join: {
            from: 'requisitions.id',
            to: 'requisition_events.id',
          }
        }
      }
    }
  }