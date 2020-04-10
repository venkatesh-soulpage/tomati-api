import Model from './model';
import models from '../models';

export default class Role extends Model {
    static get tableName () {
      return 'roles'
    }
  
    static get relationMappings () {
      return {
        client_collaborators: {
          relation: Model.HasManyRelation,
          modelClass: models.ClientCollaborator,
          join: {
            from: 'roles.id',
            to: 'client_collaborators.role_id'
          }
        }
      }
    }
  }