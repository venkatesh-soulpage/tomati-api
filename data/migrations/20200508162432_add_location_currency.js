
exports.up = async (knex) => {
    return knex.schema.alterTable('locations', table => {
        // Default to 50mb
        table.string('currency').notNullable().defaultTo('USD')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('locations', table => {
        table.dropColumn('currency');
    })
}

