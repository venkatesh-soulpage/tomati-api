exports.up = async (knex) => {
    return await knex.schema.alterTable('regional_organization_locations', table => {
        table.boolean('is_primary_location').notNullable().defaultTo(false)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('regional_organization_locations', table => {
        table.dropColumn('is_primary_location')
    })
}

