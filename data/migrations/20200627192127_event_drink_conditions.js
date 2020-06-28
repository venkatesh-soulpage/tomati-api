
exports.up = async (knex) => {

    return knex.schema.createTable('event_free_drinks_conditions', table => {
        table.increments('id').primary()
        table.integer('event_id').references('events.id').notNullable()
        table.string('condition_type').notNullable()
        table.integer('min_age')
        table.integer('max_age')
        table.string('gender')
        table.integer('limit')
        table.string('start_time')
        table.string('end_time')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('event_free_drinks_conditions')
}

