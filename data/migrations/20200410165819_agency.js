
exports.up = async (knex) => {

    return knex.schema.createTable('agencies', table => {
        table.increments('id').primary()
        table.integer('owner_id').references('accounts.id')
        table.integer('invited_by').references('clients.id')
        table.integer('location_id').references('locations.id')
        table.string('name').notNullable()
        table.string('description')
        table.string('contact_email')
        table.string('sla_terms').notNullable()
        table.integer('sla_hours_before_event_creation').notNullable()
        table.integer('sla_hours_before_event_update').notNullable()
        table.string('sla_accepted').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('agencies')
}
