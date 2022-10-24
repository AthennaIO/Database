/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotConnectedDatabaseException extends Exception {
  /**
   * Creates a new instance of NotConnectedDatabaseException.
   *
   * @return {NotConnectedDatabaseException}
   */
  constructor() {
    const content = `Database is not connected to perform queries.`

    super(
      content,
      500,
      'E_NOT_CONNECTED_ERROR',
      `This happens when you try to use the "Database" class without calling the "await Database.connect()" method first.`,
    )
  }
}
