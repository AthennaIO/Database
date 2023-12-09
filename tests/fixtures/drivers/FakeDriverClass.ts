/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Driver } from '#src/drivers/Driver'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class FakeDriverClass extends Driver {
  public constructor() {
    super('fake')
    return FakeDriver
  }
}
