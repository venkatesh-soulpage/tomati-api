exports.up = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.integer('ended_by').references('accounts.id')
    })
}

exports.down = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.dropColumn('ended_by')
    })

}
