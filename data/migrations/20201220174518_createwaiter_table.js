exports.up = async (knex) => {
  await knex.schema.createTable("outlet_waiters", (table) => {
    table.increments("id").primary();
    table.integer("account_id").references("accounts.id");
    table
      .integer("outletevent_id")
      .references("outletevents.id")
      .onDelete("CASCADE");
    table
      .integer("outletvenue_id")
      .references("outletvenues.id")
      .onDelete("CASCADE");

    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();
  });

  await knex.schema.alterTable("outletvenuemenus", (table) => {
    table.text("description").alter();
  });

  return await knex.schema.alterTable("outleteventmenus", (table) => {
    table.text("description").alter();
  });
};

exports.down = async (knex) => {
  knex.schema.dropTable("outlet_waiters");
};
