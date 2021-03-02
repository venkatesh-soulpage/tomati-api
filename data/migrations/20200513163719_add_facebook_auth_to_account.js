
exports.up = async (knex) => {
    return knex.schema.alterTable('accounts', table => {
        // Default to 50mb
        table.string('facebook_access_token')
        table.biginteger('facebook_data_access_expiration_time')
        table.biginteger('facebook_user_id')
        table.string('facebook_signed_request', 1000)
        table.date('temporal_age_verification_limit')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('accounts', table => {
        table.dropColumn('facebook_access_token')
        table.dropColumn('facebook_data_access_expiration_time')
        table.dropColumn('facebook_user_id')
        table.dropColumn('facebook_signed_request')
        table.dropColumn('temporal_age_verification_limit')
    })
}

