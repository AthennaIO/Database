/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotFoundDataException extends Exception {
  /**
   * Creates a new instance of NotFoundDataException.
   *
   * @param {string} conName
   * @return {NotFoundDataException}
   */
  constructor(conName) {
    const content = `Data not found in database.`

    super(
      content,
      404,
      'E_NOT_FOUND_DATA_ERROR',
      `Data not found in database using the using ${conName} connection.`,
    )
  }
}
