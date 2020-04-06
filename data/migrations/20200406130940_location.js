
exports.up = async (knex) => {
    return knex.schema.createTable('locations', table => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('locations')
}