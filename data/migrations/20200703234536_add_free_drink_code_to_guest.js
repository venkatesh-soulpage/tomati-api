exports.up = async (knex) => {
    return await knex.schema.alterTable('event_guests', table => {
        table.string('free_drink_code')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('event_guests', table => {
        table.dropColumn('free_drink_code')
    })
}
