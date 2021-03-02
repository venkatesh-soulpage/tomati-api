
exports.up = async (knex) => {
    return await knex.schema.alterTable('collaborator_invitations', table => {
        table.integer('regional_organization_id').references('regional_organizations.id')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('collaborator_invitations', table => {
        table.dropColumn('regional_organization_id')
    })
}

