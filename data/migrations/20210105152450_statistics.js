exports.up = function (knex) {
  return knex.schema.createTable("statistics", (table) => {
    table.increments("id").primary();
    table
      .integer("outletvenue_id")
      .references("outletvenues.id")
      .onDelete("CASCADE");
    table
      .integer("outletevent_id")
      .references("outletevents.id")
      .onDelete("CASCADE");
    table.integer("count").notNullable();
  });
};

exports.down = function (knex) {
  knex.schema.dropTable("statistics");
};
