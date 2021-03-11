exports.up = async (knex) => {
  await knex.schema.alterTable("collaborator_invitations", (table) => {
    table.integer("venue_id").references("outletvenues.id");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("collaborator_invitations");
};
