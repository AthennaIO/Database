/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'

export class NullQueryBuilderException extends Exception {
  /**
   * Creates a new instance of NullQueryBuilderException.
   *
   * @param {string} className
   * @return {NullQueryBuilderException}
   */
  constructor(className) {
    const content = `Query builder doesn't exist in "${className}".`

    super(
      content,
      500,
      'E_NULL_QUERY_ERROR',
      `This usually happens when you didn't call "new Database().connection('your-connection').connect()" method to create the connection with database.`,
    )
  }
}
