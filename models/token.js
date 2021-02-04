import Model from './model';

export default class Token extends Model {
    static get tableName () {
      return 'tokens'
    }
  }