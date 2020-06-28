exports.up = async (knex) => {
    return await knex.schema.alterTable('event_products', table => {
        table.boolean('is_redeemable').notNullable().defaultTo(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('event_products', table => {
        table.dropColumn('is_redeemable')
    })
}

