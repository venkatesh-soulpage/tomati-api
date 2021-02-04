exports.up = async (knex) => {
  await knex.schema.dropTable("tomati_outletevents");
  await knex.schema.alterTable("outletevents", (table) => {
    table.timestamp("start_time").alter();
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.timestamp("end_time").alter();
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.integer("expected_guests").alter();
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.integer("no_of_outlets");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.integer("no_of_qrcodes");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.string("plan");
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.string("plan");
  });
  await knex.schema.alterTable("outletvenues", (table) => {
    table.string("transaction_id");
  });
  await knex.schema.alterTable("outletevents", (table) => {
    table.string("transaction_id");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("tomati_outletevents");
};
