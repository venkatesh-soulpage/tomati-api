
exports.up = async (knex) => {

    await knex.schema.alterTable('clients', table => {
        table.dropColumn('requisition_current_serial');
    })

    return await knex.schema.alterTable('clients', table => {
        table.integer('requisition_current_serial').notNullable().default(100000)
      })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('clients', table => {
        table.dropColumn('requisition_current_serial');
      })

    return await knex.schema.table('clients', table => {
        table.integer('requisition_current_serial').notNullable().default(10000)
    })
}

