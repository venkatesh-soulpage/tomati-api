
exports.up = async (knex) => {

    return knex.schema.createTable('requisition_deliveries', table => {
        table.increments('id').primary()
        table.integer('requisition_id').references('requisitions.id').notNullable()
        table.integer('warehouse_id').references('warehouses.id').notNullable()
        table.string('status')
        table.string('waybill')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisition_deliveries')
}
