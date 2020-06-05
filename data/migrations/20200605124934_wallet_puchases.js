
exports.up = async (knex) => {

    return await knex.schema.createTable('wallet_purchases', table => {
        table.increments('id').primary()
        table.integer('wallet_id').references('wallets.id').notNullable()
        table.string('payment_type').notNullable()
        table.integer('amount').notNullable()
        table.string('status').notNullable()
        // Only used for paypal payments
        table.string('paypal_order_id')
        // Only used for scanned payments
        table.integer('scanned_by').references('accounts.id')
        table.integer('event_id').references('events.id')
        table.string('qr_code')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
    })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('wallet_purchases')
}

