exports.up = async (knex) => {

    return knex.schema.createTable('agency_collaborators', table => {
        table.increments('id').primary()
        table.integer('role_id').references('roles.id')
        table.integer('account_id').references('accounts.id')
        table.integer('agency_id').references('agencies.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('agency_collaborators')
}