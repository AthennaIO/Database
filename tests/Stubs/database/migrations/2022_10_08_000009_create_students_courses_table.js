import { Migration } from '#src/index'

export class StudentCourseMigration extends Migration {
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
    return knex.schema.createTable('students_courses', table => {
      table.uuid('id').primary().defaultTo(knex.raw('(UUID())'))

      table.uuid('courseId').references('id').inTable('courses')
      table.uuid('studentId').references('id').inTable('students')
    })
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down({ schema }) {
    return schema.dropTableIfExists('students_courses')
  }
}
