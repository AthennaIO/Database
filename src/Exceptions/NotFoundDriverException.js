/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@secjs/utils'
import { DriverFactory } from '#src/Factories/DriverFactory'

export class NotFoundDriverException extends Exception {
  /**
   * Creates a new instance of NotFoundDriverException.
   *
   * @param {string} driverName
   * @return {NotFoundDriverException}
   */
  constructor(driverName) {
    const content = `The driver ${driverName} has not been found.`
    const availableDrivers = DriverFactory.availableDrivers().join(', ')

    super(
      content,
      500,
      'E_NOT_FOUND_ERROR',
      `Available drivers are: ${availableDrivers}. Look into your config/database file if ${driverName} driver is implemented by datanase. Or create ${driverName} driver implementation using DriverFactory.createDriver("${driverName}", ...) method.`,
    )
  }
}
