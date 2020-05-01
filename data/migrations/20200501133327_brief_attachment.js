
exports.up = async (knex) => {

    return knex.schema.createTable('brief_attachments', table => {
        table.increments('id').primary()
        table.integer('brief_id').references('briefs.id').notNullable()
        table.string('url').notNullable()
        table.string('file_name').notNullable()
        table.string('file_type').notNullable(),
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      })
}

exports.down = async (knex) => {
    return knex.schema.dropTable('brief_attachments')
}

