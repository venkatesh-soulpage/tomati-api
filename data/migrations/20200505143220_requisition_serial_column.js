
exports.up = async (knex) => {

    return knex.schema.alterTable('requisitions', table => {
        table.integer('serial_number').notNullable().defaultTo(0)
      })
}

exports.down = async (knex) => {
    return knex.schema.table('requisitions', table => {
        table.dropColumn('serial_number');
    })
}

