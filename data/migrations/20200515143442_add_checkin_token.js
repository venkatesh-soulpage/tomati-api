
exports.up = async (knex) => {
    return knex.schema.alterTable('event_guests', table => {
        // Default to 50mb
        table.string('check_in_token')
        table.boolean('checked_in').defaultTo(false)
        table.timestamp('check_in_time')
        table.timestamp('check_out_time')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('event_guests', table => {
        table.dropColumn('check_in_token')
        table.dropColumn('checked_in')
        table.dropColumn('check_in_time')
        table.dropColumn('check_out_time')
    })
}

