
exports.up = async (knex) => {

    return knex.schema.createTable('tokens', table => {
        table.increments('id').primary()
        table.string('email').notNullable()
        table.string('token').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('tokens')
}
