
exports.up = async (knex) => {

    return await knex.schema.alterTable('events', table => {
        table.integer('credits_left').notNullable().defaultTo(0)
      })
}

exports.down = async (knex) => {

    return await knex.schema.table('events', table => {
        table.dropColumn('credits_left')
    })
}

