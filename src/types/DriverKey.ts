/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Driver } from '#src/database/drivers/Driver'

export type DriverKey = {
  Driver: new (...args: any[]) => Driver
  client?: any
}
