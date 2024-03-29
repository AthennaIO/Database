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
import { HasOne } from '#src/models/annotations/HasOne'
import { HasMany } from '#src/models/annotations/HasMany'
import { Product } from '#tests/fixtures/models/e2e/Product'
import { Profile } from '#tests/fixtures/models/e2e/Profile'

export class User extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @HasOne(() => Profile)
  public profile: Relation<Profile>

  @HasMany(() => Product)
  public products: Relation<Product[]>

  @Column({ isCreateDate: true })
  public createdAt: Date

  @Column({ isUpdateDate: true })
  public updatedAt: Date

  @Column({ isDeleteDate: true })
  public deletedAt: Date
}
