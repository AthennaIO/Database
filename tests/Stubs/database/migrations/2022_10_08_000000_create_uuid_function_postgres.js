import { Migration } from '#src/index'

export class UuidFunctionMigration extends Migration {
  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get connection() {
    return 'postgres'
  }

  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up(knex) {
    return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down() {}
}
