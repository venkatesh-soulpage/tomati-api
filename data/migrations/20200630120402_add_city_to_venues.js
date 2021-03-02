exports.up = async (knex) => {
    return await knex.schema.alterTable('venues', table => {
        table.integer('location_id')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('venues', table => {
        table.dropColum('location_id')
    })
}

