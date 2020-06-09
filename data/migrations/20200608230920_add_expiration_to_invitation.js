
exports.up = async (knex) => {

    return await knex.schema.alterTable('collaborator_invitations', table => {
        table.timestamp('expiration_date').notNullable().defaultTo(knex.fn.now())
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('collaborator_invitations', table => {
        table.dropColumn('expiration_date')
    })
}

