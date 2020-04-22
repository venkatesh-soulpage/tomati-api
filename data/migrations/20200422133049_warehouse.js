
exports.up = async (knex) => {

    return knex.schema.createTable('warehouses', table => {
        table.increments('id').primary()
        table.integer('client_id').references('clients.id').notNullable()
        table.integer('location_id').references('locations.id').notNullable()
        table.string('name').notNullable()
        table.string('address').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('warehouses')
}
