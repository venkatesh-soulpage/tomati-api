exports.up = function (knex) {
  return knex.schema.createTable("outletevents", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.timestamp("start_time").notNullable();
    table.timestamp("end_time").notNullable();
    table.integer("expected_guests").notNullable();
    table.integer("expected_hourly_guests");
    table.string("comments");
    table.integer("location_id").references("locations.id");
    table.string("address").notNullable();
    table.integer("account_id").references("accounts.id");
    table.string("menu_link");
    table.string("description");
    table.string("cover_image");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletevents");
};
