exports.up = async (knex) => {
    return await knex.schema.alterTable('accounts', table => {
        table.string('refresh_token')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('accounts', table => {
        table.dropColumn('refresh_token')
    })
}

