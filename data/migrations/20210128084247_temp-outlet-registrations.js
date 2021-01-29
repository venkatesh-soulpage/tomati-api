exports.up = function (knex) {
  return knex.schema.createTable("temp_outlet_registrations", (table) => {
    table.increments("id").primary();
    table.string("full_name").notNullable();
    table.string("company_name").notNullable();
    table.string("email").notNullable();
    table.string("password_hash").notNullable();
    table.string("location").notNullable();
    table.string("street_address").notNullable();
    table.string("plan").notNullable();
    table.integer("no_of_outlets");
    table.integer("no_of_qrcodes");
    table.enum("registration_type", ["outlet", "event"]);
    table.boolean("is_billed").defaultTo(false);
    table.boolean("is_privacy_agreed").defaultTo(false);
    table.boolean("is_approved").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("temp_outlet_registrations");
};
