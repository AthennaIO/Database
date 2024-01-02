/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel } from '#src/models/BaseModel'
import { Column } from '#src/models/annotations/Column'

export class Order extends BaseModel {
  @Column()
  public id: string

  @Column({ isHidden: true })
  public price: string
}
