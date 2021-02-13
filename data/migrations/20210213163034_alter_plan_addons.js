exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.dropColumn("outlet_addon_price");
    table.dropColumn("event_addon_price");
    table.dropColumn("qr_tags_addon_price");
    table.dropColumn("user_addon_price");
    table.float("outlet_addon_price");
    table.float("event_addon_price");
    table.float("qr_tags_addon_price");
    table.float("user_addon_price");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
