
exports.up = async (knex) => {

    return knex.schema.createTable('product_ingredients', table => {
        table.increments('id').primary()
        table.integer('product_parent_id').references('products.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.float('quantity').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('product_ingredients')
}
