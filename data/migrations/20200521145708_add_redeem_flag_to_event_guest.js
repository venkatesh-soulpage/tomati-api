
exports.up = async (knex) => {

    return await knex.schema.alterTable('event_guests', table => {
        table.boolean('code_redeemed').notNullable().default(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('event_guests', table => {
        table.dropColumn('code_redeemed')
    })
}

