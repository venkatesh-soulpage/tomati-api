
exports.up = async (knex) => {

    return knex.schema.createTable('brief_products', table => {
        table.increments('id').primary()
        table.integer('brief_id').references('briefs.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.float('limit').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('brief_products')
}
