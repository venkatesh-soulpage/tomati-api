exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenues", (table) => {
    table.boolean("is_qr_active").defaultTo(true);
    table.boolean("is_venue_active").defaultTo(true);
  });
};

exports.down = async (knex) => {
  await knex.schema.table("outletvenues", (table) => {
    table.dropColumn("is_qr_active");
    table.dropColumn("is_venue_active");
  });
};
