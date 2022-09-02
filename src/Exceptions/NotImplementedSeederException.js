/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NotImplementedSeederException extends Exception {
  /**
   * Creates a new instance of NotImplementedSeederException.
   *
   * @return {NotImplementedSeederException}
   */
  constructor(modelName) {
    const content = `Run method not implemented on seed..`

    super(
      content,
      500,
      'E_NOT_IMPLEMENTED_SEEDER_ERROR',
      `Open your ${modelName} seeder and write your "run()" method.`,
    )
  }
}
