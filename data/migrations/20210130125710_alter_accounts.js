exports.up = async (knex) => {
  await knex.schema.alterTable("outletevents", (table) => {
    table.dropColumn("transaction_id");
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.dropColumn("plan");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.dropColumn("transaction_id");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.dropColumn("plan");
    table.dropColumn("no_of_outlets");
    table.dropColumn("no_of_qrcodes");
  });
  await knex.schema.createTable("plans", (table) => {
    table.increments("id").primary();
    table.string("plan").notNullable();
    table.integer("outlet_limit").notNullable();
    table.integer("event_limit").notNullable();
    table.integer("cost").notNullable();
  });
  await knex.schema.alterTable("accounts", (table) => {
    table.string("transaction_id");
    table.integer("plan_id").references("plans.id");
    table.integer("no_of_outlets");
    table.integer("no_of_qrcodes");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("accounts");
};
