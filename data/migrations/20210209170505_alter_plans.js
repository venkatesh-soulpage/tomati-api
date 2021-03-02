exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.dropColumn("cost");
  });
  await knex.schema.alterTable("plans", (table) => {
    table.integer("no_of_outlets");
    table.integer("no_of_qr_tags");
    table.string("subscription_type");
    table.integer("price");
  });
};

exports.down = async (knex) => {
  await knex.schema.table("plans", (table) => {
    table.dropColumn("no_of_outlets");
  });
  await knex.schema.table("plans", (table) => {
    table.dropColumn("no_of_qr_tags");
  });
  await knex.schema.table("plans", (table) => {
    table.dropColumn("subscription_type");
  });
  await knex.schema.table("plans", (table) => {
    table.dropColumn("price");
  });
};
