exports.up = function (knex) {
  return knex.schema.alterTable("outletvenuemenus", (table) => {
    table.json("free_sides");
    table.json("paid_sides");
    table.integer("maximum_sides");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletvenuemenus");
};
