/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class LockTimeoutException extends Exception {
  public constructor(key: string, timeout: number) {
    super({
      status: 500,
      code: 'E_LOCK_TIMEOUT_ERROR',
      message: `Could not acquire the "${key}" lock within ${timeout}ms.`,
      help: `Another process is holding the "${key}" lock for longer than the configured timeout. Increase the timeout option, reduce the work done while holding the lock, or remove the timeout to wait indefinitely.`
    })
  }
}
