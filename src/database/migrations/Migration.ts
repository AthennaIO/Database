/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'

export abstract class Migration {
  /**
   * Create a table instance.
   */
  public static get connection(): string {
    return 'default'
  }

  /**
   * Run the migrations.
   */
  public abstract up(knex: Knex): Promise<void>

  /**
   * Reverse the migrations.
   */
  public abstract down(knex: Knex): Promise<void>
}
