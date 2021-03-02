
exports.up = async (knex) => {

    return await knex.schema.createTable('verification_logs', table => {
        table.increments('id').primary()
        table.integer('account_id').references('accounts.id')
        table.integer('verified_by').references('accounts.id')
        table.integer('client_id').references('clients.id')
        table.integer('regional_organization_id').references('regional_organizations.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {

    // Delete verification logs
    return knex.schema.dropTable('verification_logs')
}

