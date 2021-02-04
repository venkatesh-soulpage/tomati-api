
exports.up = async (knex) => {
    return knex.schema.alterTable('requisition_deliveries', table => {
        table.integer('requisition_delivery_parent_id')
        table.boolean('enabled').defaultTo(true)
      })
}

exports.down = async (knex) => {
    return knex.schema.table('requisition_deliveries', table => {
        table.dropColumn('requisition_delivery_parent_id')
        table.dropColumn('enabled')
    })
}

