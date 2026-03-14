/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class EmptyColumnException extends Exception {
  public constructor(method: string) {
    const message = `The column set in your query builder ${method} method is empty or with wrong type.`

    super({
      message,
      code: 'E_EMPTY_COLUMN_ERROR',
      help: `You must set a column value to perform the ${method}() operation. Accepted values are only strings and objects.`
    })
  }
}
