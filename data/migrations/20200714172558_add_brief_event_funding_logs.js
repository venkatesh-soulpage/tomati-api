
exports.up = async (knex) => {
    return knex.schema.createTable('event_funding_logs', table => {
        table.increments('id').primary()
        table.integer('account_id').references('accounts.id').notNullable()
        table.integer('event_id').references('events.id').notNullable()
        table.float('amount').notNullable()
        table.string('action').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('event_funding_logs')
}