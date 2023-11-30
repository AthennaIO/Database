/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import { Column } from '#src/models/annotations/Column'

export class Product extends Model {
  public static connection() {
    return 'fake'
  }

  @Column()
  public id: string
}
