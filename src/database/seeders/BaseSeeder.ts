/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type DatabaseImpl } from '#src/database/DatabaseImpl'

export abstract class BaseSeeder {
  /**
   * Run the database seeders.
   */
  public abstract run(db?: DatabaseImpl): void | Promise<void>
}
