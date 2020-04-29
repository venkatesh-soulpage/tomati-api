
exports.up = async (knex) => {

    return knex.schema.createTable('requisition_orders', table => {
        table.increments('id').primary()
        table.integer('requisition_id').references('requisitions.id').notNullable()
        table.integer('brief_event_id').references('brief_events.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.float('price').notNullable()
        table.integer('units').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisition_orders')
}
