exports.up = async (knex) => {

    return knex.schema.createTable('wallet_orders', table => {
        table.increments('id').primary()
        table.integer('wallet_id').references('wallets.id').notNullable()
        table.float('total_amount').notNullable()
        table.string('order_identifier').notNullable()
        table.string('status').defaultTo('CREATED')
        table.string('type')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('wallet_orders')
}

