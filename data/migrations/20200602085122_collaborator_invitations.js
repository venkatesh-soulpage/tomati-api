
exports.up = async (knex) => {

    return knex.schema.createTable('collaborator_invitations', table => {
        table.increments('id').primary()
        table.integer('client_id').references('clients.id')
        table.integer('agency_id').references('agencies.id')
        table.integer('role_id').references('roles.id').notNullable()
        table.string('email').notNullable()
        table.string('status').defaultTo('PENDING').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('collaborator_invitations')
}

