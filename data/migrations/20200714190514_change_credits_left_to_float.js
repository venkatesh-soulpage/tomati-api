exports.up = async (knex) => {

    await knex.schema.alterTable('events', table => {
        table.dropColumn('credits_left')
      })

    return await knex.schema.alterTable('events', table => {
        table.float('credits_left').notNullable().defaultTo(0);
    })
}

exports.down = async (knex) => {

    await knex.schema.alterTable('events', table => {
        table.dropColumn('credits_left')
    })

    return await knex.schema.alterTable('events', table => {
        table.integer('credits_left').notNullable().defaultTo(0);
    })
}
