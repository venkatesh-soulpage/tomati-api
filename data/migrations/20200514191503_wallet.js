
exports.up = async (knex) => {

    return knex.schema.createTable('wallets', table => {
        table.increments('id').primary()
        table.integer('account_id').references('accounts.id').notNullable()
        table.string('balance').defaultTo(0).notNullable()
        table.string('loyalty_points').defaultTo(0).notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('wallets')
}

