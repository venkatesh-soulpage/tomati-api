
exports.up = async (knex) => {

    return await knex.schema.alterTable('wallet_orders', table => {
        table.integer('scanned_by').references('accounts.id')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('wallet_orders', table => {
        table.dropColumn('scanned_by')
    })
}

