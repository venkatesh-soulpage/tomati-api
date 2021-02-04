
exports.up = async (knex) => {

    await knex.schema.dropTable('brief_products');
    
    return knex.schema.createTable('brief_brands', table => {
        table.increments('id').primary()
        table.integer('brief_id').references('briefs.id').notNullable()
        table.integer('brand_id').references('brands.id').notNullable()
        table.float('limit').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('brief_brands')
}

