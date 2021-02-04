
exports.up = async (knex) => {

    return await knex.schema.alterTable('clients', table => {
        table.boolean('active').notNullable().default(true)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('clients', table => {
        table.dropColumn('active')
    })
}

