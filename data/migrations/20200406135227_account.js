
exports.up = async (knex) => {

    return knex.schema.createTable('accounts', table => {
        table.increments('id').primary()
        table.integer('location_id').references('locations.id')
        table.string('first_name').notNullable()
        table.string('last_name').notNullable()
        table.string('email').notNullable()
        table.string('phone_number')
        table.string('password_hash').notNullable()
        table.boolean('is_admin').notNullable()
        table.boolean('is_email_verified').notNullable()
        table.boolean('is_age_verified').notNullable()
        table.string('password_reset_token')
        table.timestamp('password_reset_expiration')
        table.timestamp('age_verified_at')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('accounts')
}
