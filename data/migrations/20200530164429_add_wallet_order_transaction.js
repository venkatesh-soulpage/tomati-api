exports.up = async (knex) => {

    return knex.schema.createTable('wallet_order_transactions', table => {
        table.increments('id').primary()
        table.integer('wallet_order_id').references('wallet_orders.id').notNullable()
        table.integer('event_product_id').references('event_products.id').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('wallet_order_transactions')
}

