exports.up = async (knex) => {

    return await knex.schema.alterTable('event_guests', table => {
        table.integer('checked_in_by').references('accounts.id')
        table.integer('checked_out_by').references('accounts.id')
    })
}

exports.down = async (knex) => {

    return await knex.schema.alterTable('event_guests', table => {
        table.dropColumn('checked_in_by')
        table.dropColumn('checked_out_by')
    })

}
