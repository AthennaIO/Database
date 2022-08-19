/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class EmptyWhereException extends Exception {
  /**
   * Creates a new instance of EmptyWhereException.
   *
   * @param {string} method
   * @param {string} fallbackMethod
   * @return {EmptyWhereException}
   */
  constructor(method, fallbackMethod) {
    const content = `Be careful, you are trying to call "${method}" method with empty "where" object.`

    super(
      content,
      500,
      'E_EMPTY_WHERE_ERROR',
      `If you really want to do that use "${fallbackMethod}" method instead.`,
    )
  }
}
