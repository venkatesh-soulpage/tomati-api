
exports.up = async (knex) => {

    return knex.schema.createTable('warehouse_stocks', table => {
        table.increments('id').primary()
        table.integer('warehouse_id').references('warehouses.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.float('quantity').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('warehouse_stocks')
}
