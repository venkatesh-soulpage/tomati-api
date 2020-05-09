
exports.up = async (knex) => {

    return knex.schema.createTable('event_guests', table => {
        table.increments('id').primary()
        table.integer('event_id').references('events.id').notNullable()
        table.integer('account_id').references('accounts.id')
        table.string('first_name').notNullable()
        table.string('last_name')
        table.string('email')
        table.string('phone_number')
        table.string('code').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('event_guests')
}

