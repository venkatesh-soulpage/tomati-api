
exports.up = async (knex) => {
    return knex.schema.alterTable('brief_attachments', table => {
        // Default to 50mb
        table.integer('size').notNullable().defaultTo(0)
      })
}

exports.down = async (knex) => {
    return knex.schema.table('brief_attachments', table => {
        table.dropColumn('size');
    })
}

