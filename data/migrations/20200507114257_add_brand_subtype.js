
exports.up = async (knex) => {

    return knex.schema.alterTable('brands', table => {
        table.string('product_subtype').notNullable().defaultTo('Other')
      })
}

exports.down = async (knex) => {
    return knex.schema.table('brands', table => {
        table.dropColumn('product_subtype');
    })
}

