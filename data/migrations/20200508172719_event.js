
exports.up = async (knex) => {

    return knex.schema.createTable('events', table => {
        table.increments('id').primary()
        table.integer('brief_event_id').references('brief_events.id').notNullable()
        table.string('setup_at').notNullable()
        table.string('started_at').notNullable()
        table.string('ended_at').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('events')
}

