
exports.up = async (knex) => {

    return await knex.schema.alterTable('clients', table => {
        table.timestamp('expiration_date').notNullable().defaultTo(knex.fn.now())
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('clients', table => {
        table.dropColumn('expiration_date')
    })
}

