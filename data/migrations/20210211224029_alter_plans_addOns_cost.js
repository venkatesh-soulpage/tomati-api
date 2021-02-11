exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.integer("outlet_addon_price");
    table.integer("qr_tags_addon_price");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
