exports.up = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.float('total_credits_funded').notNullable().defaultTo(0);
    })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('events', table => {
        table.dropColumn('total_credits_funded')
    })
}
