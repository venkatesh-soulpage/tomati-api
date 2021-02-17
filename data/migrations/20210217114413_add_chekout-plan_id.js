exports.up = async (knex) => {
  await knex.schema.alterTable("plans", (table) => {
    table.string("chargebee_plan_id");
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTable("plans");
};
