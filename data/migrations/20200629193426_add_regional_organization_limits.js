exports.up = async (knex) => {
    return await knex.schema.alterTable('regional_organizations', table => {
        table.integer('collaborator_limit').notNullable().defaultTo(5)
        table.integer('briefs_limit').notNullable().defaultTo(5)
        table.integer('brands_limit').notNullable().defaultTo(5)
        table.integer('warehouses_limit').notNullable().defaultTo(1)
        table.integer('identity_verifications_limit').notNullable().defaultTo(100)
        table.integer('agencies_limit').notNullable().defaultTo(1)
        table.integer('agency_collaborators_limit').notNullable().defaultTo(1)
        table.integer('brief_attachment_limits').notNullable().defaultTo(52428800)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('regional_organizations', table => {
        table.dropColum('collaborator_limit')
        table.dropColum('briefs_limit')
        table.dropColum('brands_limit')
        table.dropColum('warehouses_limit')
        table.dropColum('identity_verifications_limit')
        table.dropColum('agencies_limit')
        table.dropColum('agency_collaborators_limit')
        table.integer('brief_attachment_limits').notNullable().defaultTo(52428800)
    })
}

