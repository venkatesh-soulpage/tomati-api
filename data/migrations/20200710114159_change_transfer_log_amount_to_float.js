exports.up = async (knex) => {

    await knex.schema.alterTable('transfer_logs', table => {
        table.dropColumn('amount')
      })

    return await knex.schema.alterTable('transfer_logs', table => {
        table.float('amount').notNullable().defaultTo(0);
    })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('transfer_logs', table => {
        table.dropColumn('amount')
    })

    return await knex.schema.alterTable('transfer_logs', table => {
        table.integer('amount').notNullable().defaultTo(0);
    })
}
