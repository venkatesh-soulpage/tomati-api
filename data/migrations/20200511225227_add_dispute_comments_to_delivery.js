
exports.up = async (knex) => {
    return knex.schema.alterTable('requisition_deliveries', table => {
        // Default to 50mb
        table.string('comments')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('requisition_deliveries', table => {
        table.dropColumn('comments');
    })
}

