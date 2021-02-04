
exports.up = async (knex) => {

    return knex.schema.createTable('regional_organization_locations', table => {
        table.increments('id').primary()
        table.integer('location_id').references('locations.id')
        table.integer('regional_organization_id').references('regional_organizations.id')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('regional_organization_locations')
}