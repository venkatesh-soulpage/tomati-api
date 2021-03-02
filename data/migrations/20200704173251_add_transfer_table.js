
exports.up = async (knex) => {
    return knex.schema.createTable('transfer_logs', table => {
        table.increments('id').primary()
        table.integer('from_account_id').references('accounts.id')
        table.integer('to_account_id').references('accounts.id')
        table.integer('amount')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('transfer_logs')
}