/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NotImplementedMigrationException } from '#src/Exceptions/NotImplementedMigrationException'

export class Migration {
  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get connection() {
    return 'default'
  }

  /**
   * Run the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  up(knex) {
    throw new NotImplementedMigrationException(this.constructor.name)
  }

  /**
   * Reverse the migrations.
   *
   * @param {import('knex').Knex} knex
   * @return {Promise<any>}
   */
  down(knex) {
    throw new NotImplementedMigrationException(this.constructor.name)
  }
}
