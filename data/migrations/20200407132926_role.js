
exports.up = async (knex) => {

    return knex.schema.createTable('roles', table => {
        table.increments('id').primary()
        table.string('scope').notNullable()
        table.string('name').notNullable()
        table.string('description')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('roles')
}
