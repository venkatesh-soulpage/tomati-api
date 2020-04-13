
exports.up = async (knex) => {
    return knex.schema.createTable('locations', table => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
        table.boolean('passport_available').defaultTo(true)
        table.boolean('id_card_available').defaultTo(true)
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('locations')
}