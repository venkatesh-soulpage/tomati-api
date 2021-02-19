exports.up = async (knex) => {
  await knex.schema.dropTable("addons");
  await knex.schema.alterTable("plans", (table) => {
    table.string("chargebee_collaborators_addon_id");
    table.string("chargebee_qr_addon_id");
    table.string("chargebee_events_addon_id");
    table.string("chargebee_outlets_addon_id");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
