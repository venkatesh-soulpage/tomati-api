
exports.up = async (knex) => {
    return knex.schema.alterTable('clients', table => {
        // Default to 50mb
        table.integer('brief_attachment_limits').notNullable().defaultTo(52428800)
      })
}

exports.down = async (knex) => {
    return knex.schema.table('clients', table => {
        table.dropColumn('brief_attachment_limits');
    })
}

