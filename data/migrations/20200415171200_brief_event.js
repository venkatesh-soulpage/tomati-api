
exports.up = async (knex) => {

    return knex.schema.createTable('brief_events', table => {
        table.increments('id').primary()
        table.integer('brief_id').references('briefs')
        table.timestamp('setup_time').notNullable()
        table.timestamp('start_time').notNullable()
        table.timestamp('end_time').notNullable()
        table.boolean('recee_required').defaultTo(false).notNullable()
        table.timestamp('recee_time')
        table.integer('expected_guests').notNullable()
        table.integer('hourly_expected_guests').notNullable()
        table.boolean('drinks_enabled').defaultTo(false).notNullable()
        table.boolean('cocktails_enabled').defaultTo(false).notNullable()
        table.integer('cocktails_per_guest')
        table.boolean('free_drinks_enabled').defaultTo(false).notNullable()
        table.integer('free_drinks_per_guest')
        table.string('name')
        table.string('cash_collected_by')
        table.string('comments')
        table.string('status')
        table.boolean('enabled')
        table.integer('parent_brief_event_id')
        table.integer('venue_id').references('venues')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('brief_events')
}
