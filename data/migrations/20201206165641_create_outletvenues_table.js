exports.up = function (knex) {
  return knex.schema.createTable("outletvenues", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("location_id").references("locations.id");
    table.string("address").notNullable();
    table.string("longitude");
    table.string("latitude");
    table.string("menu_link");
    table.string("description");
    table.string("cover_image");
    table.integer("account_id").references("accounts.id");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletvenues");
};
