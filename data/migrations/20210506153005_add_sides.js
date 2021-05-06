exports.up = function (knex) {
  return knex.schema.alterTable("outletvenuemenus", (table) => {
    table.json("sides");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("outletvenuemenus");
};
