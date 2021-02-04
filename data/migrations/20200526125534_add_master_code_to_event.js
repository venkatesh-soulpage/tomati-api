
exports.up = async (knex) => {
    return await knex.schema.alterTable('events', table => {
        table.boolean('is_master_code_enabled').notNullable().defaultTo(false)
        table.string('master_code')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('events', table => {
        table.dropColumn('is_master_code_enabled')
        table.dropColumn('master_code')
    })
}

