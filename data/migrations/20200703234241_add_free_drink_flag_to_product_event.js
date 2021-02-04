exports.up = async (knex) => {
    return await knex.schema.alterTable('event_products', table => {
        table.boolean('is_free_drink').notNullable().defaultTo(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('event_products', table => {
        table.dropColumn('is_free_drink')
    })
}
