/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Relation } from '#src/types'
import { BaseModel } from '#src/models/BaseModel'
import { Column } from '#src/models/annotations/Column'
import { HasMany } from '#src/models/annotations/HasMany'
import { Sale } from '#tests/fixtures/models/e2e/Sale'
import { SaleItem } from '#tests/fixtures/models/e2e/SaleItem'
import { HasOneThrough } from '#src/models/annotations/HasOneThrough'
import { HasManyThrough } from '#src/models/annotations/HasManyThrough'

export class Appointment extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @HasMany(() => SaleItem)
  public saleItems: Relation<SaleItem[]>

  @HasOneThrough(() => Sale, () => SaleItem, { inverse: true })
  public sale: Relation<Sale | null>

  @HasManyThrough(() => Sale, () => SaleItem, { inverse: true })
  public sales: Relation<Sale[]>
}
