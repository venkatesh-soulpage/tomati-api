
exports.up = async (knex) => {

    return knex.schema.createTable('venues', table => {
        table.increments('id').primary()
        table.integer('created_by').references('clients.id').notNullable()
        table.string('name').notNullable()
        table.string('address').notNullable()
        table.string('contact_name')
        table.string('contact_email')
        table.string('contact_phone_number')
        table.float('latitude')
        table.float('longitude')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('venues')
}
