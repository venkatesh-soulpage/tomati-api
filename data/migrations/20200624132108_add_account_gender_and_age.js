exports.up = async (knex) => {
    return await knex.schema.alterTable('accounts', table => {
        table.string('gender')
        table.timestamp('date_of_birth')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('accounts', table => {
        table.dropColumn('gender')
        table.dropColumn('date_of_birth')
    })
}

