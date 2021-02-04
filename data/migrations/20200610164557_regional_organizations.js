
exports.up = async (knex) => {

    return await knex.schema.createTable('regional_organizations', table => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('description').notNullable()
        table.string('contact_email').notNullable()
        table.timestamp('expiration_date').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
    })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('regional_organizations')
}

