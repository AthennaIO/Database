/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class BadJoinException extends Exception {
  /**
   * Creates a new instance of BadJoinException.
   *
   * @return {BadJoinException}
   */
  constructor(foreignField, tableName) {
    const content = `Property ${foreignField} should join in ${tableName}.`

    super(content, 500, 'E_BAD_JOIN_ERROR')
  }
}
