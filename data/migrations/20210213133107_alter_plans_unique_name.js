exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.dropColumn("plan");
  });
  await knex.schema.alterTable("plans", (table) => {
    table.string("plan").notNullable();
    table.decimal("event_addon_price").alter();
    table.decimal("user_addon_price").alter();
    table.decimal("outlet_addon_price").alter();
    table.decimal("qr_tags_addon_price").alter();
    table.decimal("price").alter();
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
