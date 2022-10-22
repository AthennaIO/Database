/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NoTableSelectedException extends Exception {
  /**
   * Creates a new instance of NoTableSelectedException.
   *
   * @return {NoTableSelectedException}
   */
  constructor() {
    const content = `You are trying to make a query without calling the "table" method.`

    super(
      content,
      500,
      'E_NO_TABLE_ERROR',
      `You can use the "database.table()" method setting the database as string or class object.`,
    )
  }
}
