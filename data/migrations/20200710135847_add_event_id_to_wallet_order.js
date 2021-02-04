exports.up = async (knex) => {

    await knex.schema.dropTable('wallet_order_transactions');
    await knex.schema.dropTable('wallet_orders');


    await knex.schema.createTable('wallet_orders', table => {
        table.increments('id').primary()
        table.integer('wallet_id').references('wallets.id').notNullable()
        table.integer('event_id').references('events.id').notNullable()
        table.integer('scanned_by').references('accounts.id')
        table.float('total_amount').notNullable()
        table.string('order_identifier').notNullable()
        table.string('status').defaultTo('CREATED')
        table.string('type')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })

    return knex.schema.createTable('wallet_order_transactions', table => {
        table.increments('id').primary()
        table.integer('wallet_order_id').references('wallet_orders.id').notNullable()
        table.integer('event_product_id').references('event_products.id').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    await knex.schema.dropTable('wallet_order_transactions');
    await knex.schema.dropTable('wallet_orders');


    await knex.schema.createTable('wallet_orders', table => {
        table.increments('id').primary()
        table.integer('wallet_id').references('wallets.id').notNullable()
        table.integer('scanned_by').references('accounts.id')
        table.float('total_amount').notNullable()
        table.string('order_identifier').notNullable()
        table.string('status').defaultTo('CREATED')
        table.string('type')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })

    return knex.schema.createTable('wallet_order_transactions', table => {
        table.increments('id').primary()
        table.integer('wallet_order_id').references('wallet_orders.id').notNullable()
        table.integer('event_product_id').references('event_products.id').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

