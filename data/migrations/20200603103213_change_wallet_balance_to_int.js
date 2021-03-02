
exports.up = async (knex) => {

    await knex.schema.table('wallets', table => {
        table.dropColumn('balance')
    })

    return await knex.schema.alterTable('wallets', table => {
        table.integer('balance').notNullable().default(0);
      })
}

exports.down = async (knex) => {

    await knex.schema.table('wallets', table => {
        table.dropColumn('balance')
    })

    return await knex.schema.alterTable('wallets', table => {
        table.string('balance').notNullable().default(0);
      })
}

