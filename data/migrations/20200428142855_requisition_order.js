
exports.up = async (knex) => {

    return knex.schema.createTable('requisition_orders', table => {
        table.increments('id').primary()
        table.integer('requisition_event_id').references('requisition_events.id').notNullable()
        table.integer('brief_product_id').references('brief_products.id').notNullable()
        table.integer('units').references('brief_products.id').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisition_orders')
}
