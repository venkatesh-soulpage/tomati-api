
exports.up = async (knex) => {
    return await knex.schema.alterTable('products', table => {
        table.string('product_type').defaultTo('OTHER')
        table.string('product_subtype').defaultTo('OTHER')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('events', table => {
        table.dropColumn('product_type')
        table.dropColumn('product_subtype')
    })
}

