
exports.up = async (knex) => {

    return knex.schema.alterTable('clients', table => {
        table.integer('requisition_current_serial').notNullable().default(10000)
      })
}

exports.down = async (knex) => {
    return knex.schema.table('clients', table => {
        table.dropColumn('requisition_current_serial');
    })
}

