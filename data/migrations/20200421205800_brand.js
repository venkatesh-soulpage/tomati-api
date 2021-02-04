
exports.up = async (knex) => {

    return knex.schema.createTable('brands', table => {
        table.increments('id').primary()
        table.integer('client_id').references('clients.id').notNullable()
        table.string('name').notNullable()
        table.string('product_type').notNullable()
        table.string('description').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('brands')
}
