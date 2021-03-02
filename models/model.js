const Knex = require('knex')
const { Model } = require('objection')
const knexfile = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const configOptions = knexfile[env];

const knexConnection = Knex(configOptions)

Model.knex(knexConnection)

export default Model;