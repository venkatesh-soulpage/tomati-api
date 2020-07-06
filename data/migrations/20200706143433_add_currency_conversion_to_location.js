exports.up = async (knex) => {
    return await knex.schema.alterTable('locations', table => {
        table.float('currency_conversion').notNullable().defaultTo(-1);
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('locations', table => {
        table.dropColumn('currency_conversion')
    })
}
