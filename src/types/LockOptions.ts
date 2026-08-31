/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type LockOptions = {
  /**
   * Maximum time in milliseconds to wait for the lock
   * before throwing a LockTimeoutException. When not
   * defined, waits indefinitely.
   */
  timeout?: number
}
