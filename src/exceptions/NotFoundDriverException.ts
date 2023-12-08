/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'
import { DriverFactory } from '#src/factories/DriverFactory'

export class NotFoundDriverException extends Exception {
  public constructor(driver: string) {
    const message = `The driver ${driver} has not been found.`
    const availableDrivers = DriverFactory.availableDrivers().join(', ')

    super({
      message,
      code: 'E_NOT_FOUND_DRIVER_ERROR',
      help: `Available drivers are: ${availableDrivers}. Look into your config/database.${Path.ext()} file if ${driver} driver is implemented by database.`
    })
  }
}
