
exports.up = async (knex) => {

    return knex.schema.createTable('products', table => {
        table.increments('id').primary()
        table.integer('brand_id').references('brands.id').notNullable()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.integer('stock').notNullable()
        table.string('metric').notNullable()
        table.float('units').notNullable()
        table.string('sku').notNullable()
        table.float('base_price').notNullable()
        table.boolean('is_cocktail').notNullable().defaultTo(false)
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('products')
}
