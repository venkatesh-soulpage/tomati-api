
exports.up = async (knex) => {

    return knex.schema.createTable('clients', table => {
        table.increments('id').primary()
        table.integer('owner_id').references('accounts.id')
        table.integer('location_id').references('locations.id')
        table.string('name').notNullable()
        table.string('description')
        table.string('contact_email')
        table.string('contact_phone_number')
        table.integer('collaborator_limit').notNullable().defaultTo(5)
        table.integer('briefs_limit').notNullable().defaultTo(5)
        table.integer('brands_limit').notNullable().defaultTo(5)
        table.integer('warehouses_limit').notNullable().defaultTo(1)
        table.integer('locations_limit').notNullable().defaultTo(1)
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('clients')
}
