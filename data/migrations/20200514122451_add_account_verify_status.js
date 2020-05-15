
exports.up = async (knex) => {
    return knex.schema.alterTable('accounts', table => {
        // Default to 50mb
        table.string('age_verification_status')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('accounts', table => {
        table.dropColumn('age_verification_status')
    })
}

