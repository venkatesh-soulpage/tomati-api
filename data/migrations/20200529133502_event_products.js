
exports.up = async (knex) => {

    return knex.schema.createTable('event_products', table => {
        table.increments('id').primary()
        table.integer('event_id').references('events.id').notNullable()
        table.integer('product_id').references('products.id').notNullable()
        table.float('price').notNullable()
        table.boolean('active').defaultTo(true).notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('event_products')
}

