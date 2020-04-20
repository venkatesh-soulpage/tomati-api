
exports.up = async (knex) => {

    return knex.schema.createTable('client_locations', table => {
        table.increments('id').primary()
        table.integer('location_id').references('locations.id')
        table.integer('client_id').references('clients.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('client_locations')
}