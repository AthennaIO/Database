/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class WrongMethodException extends Exception {
  /**
   * Creates a new instance of WrongMethodException.
   *
   * @param {string} wrong
   * @param {string} right
   * @return {WrongMethodException}
   */
  constructor(wrong, right) {
    const content = `The method ${wrong} should not be used to perform operations using this type of data.`

    super(
      content,
      500,
      'E_WRONG_METHOD_ERROR',
      `Instead try using the ${right} method.`,
    )
  }
}
