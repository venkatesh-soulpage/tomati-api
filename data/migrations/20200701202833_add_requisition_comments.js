exports.up = async (knex) => {
    return await knex.schema.alterTable('requisitions', table => {
        table.string('comments')
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('requisitions', table => {
        table.dropColum('comments')
    })
}

