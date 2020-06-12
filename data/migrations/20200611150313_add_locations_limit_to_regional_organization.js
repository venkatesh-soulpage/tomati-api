
exports.up = async (knex) => {
    return await knex.schema.alterTable('regional_organizations', table => {
        table.integer('locations_limit').notNullable().defaultTo(1)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('regional_organizations', table => {
        table.dropColumn('locations_limit')
    })
}

