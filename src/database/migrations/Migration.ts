/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Knex } from 'knex'
import { Config } from '@athenna/config'

export abstract class Migration {
  /**
   * Define the database connection that the
   * migration will use.
   */
  public static connection(): string {
    return Config.get('database.default')
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
