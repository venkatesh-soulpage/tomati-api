exports.up = async (knex) => {

    return await knex.schema.alterTable('event_free_drinks_conditions', table => {
        table.integer('role_id').references('roles.id')
    })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('events', table => {
        table.dropColumn('role_id')
    })
}
