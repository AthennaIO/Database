/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { NotImplementedSeederException } from '#src/Exceptions/NotImplementedSeederException'

export class Seeder {
  /**
   * Run the database seeders.
   *
   * @return {void|Promise<void>}
   */
  run() {
    throw new NotImplementedSeederException(this.constructor.name)
  }
}
