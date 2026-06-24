/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

/**
 * Base class for all database constraint violations that are translated from
 * a driver-specific error into a normalized Athenna exception. Catch this to
 * handle any constraint violation regardless of the underlying database.
 */
export class ConstraintViolationException extends Exception {
  /**
   * The table where the violation happened, when the driver exposes it.
   */
  public table?: string

  /**
   * The driver that produced the original error (e.g. `postgres`).
   */
  public driver?: string

  /**
   * The original, untranslated error thrown by the database client.
   */
  public raw?: any
}
