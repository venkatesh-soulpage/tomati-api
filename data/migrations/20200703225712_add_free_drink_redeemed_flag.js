exports.up = async (knex) => {
    return await knex.schema.alterTable('event_guests', table => {
        table.boolean('free_drink_redeemed').notNullable().defaultTo(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('event_guests', table => {
        table.dropColumn('free_drink_redeemed')
    })
}
