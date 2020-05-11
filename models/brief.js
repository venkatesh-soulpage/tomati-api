import Model from './model';
import models from '../models'

export default class Brief extends Model {
    static get tableName () {
      return 'briefs'
    }
  
    static get relationMappings () {
      return {
        client: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Client,
            join: {
              from: 'briefs.client_id',
              to: 'clients.id'
            }
        },
        client_collaborator: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.ClientCollaborator,
            join: {
              from: 'briefs.created_by',
              to: 'client_collaborators.id'
            }
        },
        agency: {
            relation: Model.BelongsToOneRelation,
            modelClass: models.Agency,
            join: {
              from: 'briefs.agency_id',
              to: 'agencies.id'
            }
        },
        brief_events: {
          relation: Model.HasManyRelation,
          modelClass: models.BriefEvent,
          join: {
            from: 'briefs.id',
            to: 'brief_events.brief_id',
          }
        },
        brands: {
          relation: Model.HasManyRelation,
          modelClass: models.BriefBrand,
          join: {
            from: 'briefs.id',
            to: 'brief_brands.brief_id',
          }
        },
        attachments: {
          relation: Model.HasManyRelation,
          modelClass: models.BriefAttachment,
          join: {
            from: 'briefs.id',
            to: 'brief_attachments.brief_id',
          }
        }
      }
    }
  }