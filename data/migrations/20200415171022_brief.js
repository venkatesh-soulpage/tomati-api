
exports.up = async (knex) => {

    return knex.schema.createTable('briefs', table => {
        table.increments('id').primary()
        table.integer('client_id').references('clients.id').notNullable()
        table.integer('created_by').references('client_collaborators.id').notNullable()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.string('status').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('briefs')
}
