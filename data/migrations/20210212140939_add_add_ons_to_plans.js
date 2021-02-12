exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.dropColumn("no_of_outlets");
    table.dropColumn("no_of_qr_tags");
    table.integer("event_addon_price");
    table.integer("user_addon_price");
    table.integer("user_limit");
    table.integer("qr_tags_limit");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
