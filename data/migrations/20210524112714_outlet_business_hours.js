exports.up = async (knex) => {
  await knex.schema.alterTable("outletvenues", (table) => {
    table.dropColumn("start_time");
    table.dropColumn("end_time");
    table.string("time_zone");
  });
  await knex.schema.createTable("outlet_business_hours", (table) => {
    table.increments("id").primary();
    table.enum("day", [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]);
    table.time("start_time");
    table.time("end_time");
    table.integer("outlet_venue_id").references("outletvenues.id");
    table.boolean("isAvailable");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable("outletvenues");
};
