/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@athenna/common'

export class NullableValueException extends Exception {
  public constructor(records: any) {
    if (records.length > 1) {
      records = records.join(', ')
    } else {
      records = records[0]
    }

    super({
      status: 400,
      code: 'E_NULLABLE_VALUE_ERROR',
      message: `The properties [${records}] are undefined or null.`,
      help: `Your properties [${records}] has the option isNullable set to true in it's model. Try setting values to these properties or set the isNullable property to false.`
    })
  }
}
