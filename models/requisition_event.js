import Model from './model';
import models from '../models'

export default class RequisitionEvent extends Model {
    static get tableName () {
      return 'requisition_events'
    }
  
    static get relationMappings () {
      return {
        brief: {
            relation: Model.HasOneThroughRelation,
            modelClass: models.Brief,
            join: {
              from: 'requisition_events.brief_event_id',
              through: {
                from: 'brief_events.id',
                to: 'brief_event.brief_id'
              },
              to: 'briefs.id'
            }
        },
        brief_event: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.BriefEvent,
            join: {
              from: 'requisition_event.brief_event_id',
              to: 'brief_events.id'
            }
        },
        requisition: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Requisition,
            join: {
                from: 'requisition_events.requisition_id',
                to: 'requisitions.id'
            }
        }
      }
    }
  }