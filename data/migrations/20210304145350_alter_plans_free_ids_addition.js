exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.dropColumn("chargebee_collaborators_addon_id");
    table.dropColumn("chargebee_events_addon_id");
    table.dropColumn("chargebee_outlets_addon_id");
  });
  await knex.schema.alterTable("plans", (table) => {
    table.string("chargebee_free_collaborators_addon_id");
    table.string("chargebee_paid_collaborators_addon_id");
    table.string("chargebee_free_events_addon_id");
    table.string("chargebee_paid_events_addon_id");
    table.string("chargebee_free_outlets_addon_id");
    table.string("chargebee_paid_outlets_addon_id");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
