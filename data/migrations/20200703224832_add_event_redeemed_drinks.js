exports.up = async (knex) => {
    return await knex.schema.alterTable('events', table => {
        table.integer('free_redemeed_drinks').notNullable().defaultTo(0)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('events', table => {
        table.dropColumn('free_redemeed_drinks')
    })
}
