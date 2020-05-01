
exports.up = async (knex) => {

    return knex.schema.createTable('warehouse_transactions', table => {
        table.increments('id').primary()
        table.integer('warehouse_id').references('warehouses.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.integer('account_id').references('accounts.id').notNullable()
        table.integer('requisition_id').references('requisitions.id')
        table.float('quantity').notNullable()
        table.string('action').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('warehouse_transactions')
}
