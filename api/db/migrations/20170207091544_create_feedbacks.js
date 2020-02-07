const TABLE_NAME = 'feedbacks';

exports.up = (knex) => {

  function table(t) {

    t.increments().primary();
    t.string('email');
    t.text('content').notNull();
    t.integer('assessmentId').unsigned().references('assessments.id');
    t.string('challengeId').notNull();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  }

  return knex.schema
    .createTable(TABLE_NAME, table);
};

exports.down = (knex) => {

  return knex.schema
    .dropTable(TABLE_NAME);
};
