exports.up = async (knex) => {

    return await knex.schema.alterTable('warehouse_transactions', table => {
        table.string('comments')
    })
}

exports.down = async (knex) => {

    return await knex.schema.alterTable('warehouse_transactions', table => {
        table.dropColumn('comments')
    })

}