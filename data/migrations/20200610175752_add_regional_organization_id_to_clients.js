
exports.up = async (knex) => {
    return await knex.schema.alterTable('clients', table => {
        table.integer('regional_organization_id').references('regional_organizations.id')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('clients', table => {
        table.dropColumn('regional_organization_id')
    })
}

