
exports.up = async (knex) => {
    return knex.schema.alterTable('requisitions', table => {
        // Default to 50mb
        table.string('hellosign_signature_id')
        table.string('hellosign_signature_request_id')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('requisitions', table => {
        table.dropColumn('hellosign_signature_id')
        table.dropColumn('hellosign_signature_request_id')
    })
}

