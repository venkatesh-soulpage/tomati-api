
exports.up = async (knex) => {
    return await knex.schema.alterTable('regional_organizations', table => {
        table.integer('location_limits').notNullable().defaultTo(1)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('regional_organizations', table => {
        table.dropColumn('location_limits')
    })
}

