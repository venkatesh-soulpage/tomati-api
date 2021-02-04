
exports.up = async (knex) => {

    return knex.schema.createTable('requisitions', table => {
        table.increments('id').primary()
        table.integer('brief_id').references('briefs.id').notNullable()
        table.integer('parent_requisition_id').references('requisitions.id')
        table.string('status').notNullable().defaultTo('DRAFT')
        table.string('waybill')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('requisitions')
}
