
exports.up = async (knex) => {

    return knex.schema.createTable('requisition_events', table => {
        table.increments('id').primary()
        table.integer('requisition_id').references('requisitions.id').notNullable()
        table.integer('brief_event_id').references('brief_events.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisition_events')
}
