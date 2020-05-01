import Model from './model';
import models from '.'

export default class BriefAttachment extends Model {
    static get tableName () {
      return 'brief_attachments'
    }
  
    static get relationMappings () {
      return {
        brief: {
          relation: Model.BelongsToOneRelation,
          modelClass: models.Brief,
          join: {
            from: 'brief_attachments.brief_id',
            to: 'briefs.id'
          }
        },
      }
    }
  }