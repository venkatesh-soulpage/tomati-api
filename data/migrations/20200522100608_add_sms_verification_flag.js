
exports.up = async (knex) => {

    return await knex.schema.alterTable('accounts', table => {
        table.boolean('is_phone_number_verified').notNullable().default(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('accounts', table => {
        table.dropColumn('is_phone_number_verified')
    })
}

