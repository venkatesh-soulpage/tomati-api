exports.up = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.boolean('already_refunded').notNullable().defaultTo(false);
    })
}

exports.down = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.dropColumn('already_refunded')
    })

}
