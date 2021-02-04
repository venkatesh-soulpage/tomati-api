exports.up = async (knex) => {

    await knex.schema.alterTable('wallets', table => {
        table.dropColumn('balance')
      })

    return await knex.schema.alterTable('wallets', table => {
        table.float('balance').notNullable().defaultTo(0);
    })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('wallets', table => {
        table.dropColumn('balance')
    })

    return await knex.schema.alterTable('wallets', table => {
        table.integer('balance').notNullable().defaultTo(0);
    })
}
