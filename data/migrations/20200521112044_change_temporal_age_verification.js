
exports.up = async (knex) => {

    await knex.schema.alterTable('accounts', table => {
        table.dropColumn('temporal_age_verification_limit');
    })

    return await knex.schema.alterTable('accounts', table => {
        table.timestamp('temporal_age_verification_limit')
      })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('accounts', table => {
        table.dropColumn('temporal_age_verification_limit');
      })

    return await knex.schema.table('accounts', table => {
        table.date('temporal_age_verification_limit')
    })
}

