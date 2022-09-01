/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NotFoundDataException extends Exception {
  /**
   * Creates a new instance of NotFoundDataException.
   *
   * @param {any} where
   * @param {string} conName
   * @return {NotFoundDataException}
   */
  constructor(where, conName) {
    const content = `Data not found in database using ${conName} connection.`

    super(
      content,
      500,
      'E_NOT_FOUND_DATA_ERROR',
      `The where query used was: \n\t${JSON.stringify(where, null, 2)}`,
    )
  }
}
