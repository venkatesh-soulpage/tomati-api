
exports.up = async (knex) => {

    return await knex.schema.alterTable('clients', table => {
        table.string('logo_url')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('clients', table => {
        table.dropColumn('logo_url')
    })
}

