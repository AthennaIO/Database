/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { COLUMNS_KEY } from '#src/constants/MetadataKeys'
import type { ColumnOptions } from '#src/types/columns/ColumnOptions'

export class Annotation {
  public static getColumnsMeta(target: any): ColumnOptions[] {
    return Reflect.getMetadata(COLUMNS_KEY, target) || []
  }

  public static defineColumnMeta(target: any, options: ColumnOptions) {
    const columns = Reflect.getMetadata(COLUMNS_KEY, target) || []

    columns.push(options)

    Reflect.defineMetadata(COLUMNS_KEY, columns, target)
  }
}
