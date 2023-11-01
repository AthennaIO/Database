/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NotImplementedMethodException extends Exception {
  constructor(method: string, driver: string) {
    super({
      status: 500,
      code: 'E_NOT_IMPLEMENTED_METHOD_ERROR',
      message: `The method ${method} is not available when using the ${driver} driver.`,
      help: `Rely in the documentation to check how you could get the behavior of ${method} method working for your ${driver} driver. For example, when using mongo driver, it doesn't make sense to run the raw method since mongo queries are create from JS code`
    })
  }
}
