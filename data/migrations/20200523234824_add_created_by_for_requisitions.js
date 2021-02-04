
exports.up = async (knex) => {

    return await knex.schema.alterTable('requisitions', table => {
        table.integer('created_by').references('agency_collaborators.id')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('requisitions', table => {
        table.dropColumn('created_by')
    })
}

