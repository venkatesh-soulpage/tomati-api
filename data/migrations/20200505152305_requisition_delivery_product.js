
exports.up = async (knex) => {

    return knex.schema.createTable('requisition_delivery_products', table => {
        table.increments('id').primary()
        table.integer('requisition_delivery_id').references('requisition_deliveries.id').notNullable()
        table.integer('requisition_order_id').references('requisition_orders.id').notNullable()
        table.integer('units')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisition_delivery_products')
}
