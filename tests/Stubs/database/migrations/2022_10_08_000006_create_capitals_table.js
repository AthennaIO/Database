import { Migration } from '#src/index'

export class CapitalMigration extends Migration {
  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async up(knex) {
    return knex.schema.createTable('capitals', table => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.string('name')

      table.uuid('countryId').unique().unsigned().index().references('id').inTable('countries')
    })
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  async down({ schema }) {
    return schema.dropTableIfExists('capitals')
  }
}
