import { Migration } from '#src/index'

export class CourseMigration extends Migration {
  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mysql'
  }

  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up(knex) {
    return knex.schema.createTable('courses', table => {
      table.uuid('id').primary().defaultTo(knex.raw('(UUID())'))
      table.string('name')
    })
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down({ schema }) {
    return schema.dropTableIfExists('courses')
  }
}
