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
import { HasOne } from '#src/models/annotations/HasOne'
import { Profile } from '#tests/fixtures/models/Profile'
import { Product } from '#tests/fixtures/models/Product'
import { HasMany } from '#src/models/annotations/HasMany'

export class User extends BaseModel {
  public static connection() {
    return 'fake'
  }

  public static attributes(): Partial<User> {
    return {
      metadata1: `random-1`,
      metadata2: `random-2`
    }
  }

  @Column()
  public id: string

  @Column()
  public name: string

  @Column({ isUnique: true })
  public email: string

  @Column({ persist: false })
  public score: number

  @Column()
  public metadata1: string

  @Column({ persist: false })
  public metadata2: string

  @Column({ name: 'rate_number' })
  public rate: number

  @HasOne(() => Profile)
  public profile: Profile

  @HasMany(() => Product)
  public products: Product[]

  @Column({ isCreateDate: true, name: 'created_at' })
  public createdAt: Date

  @Column({ isUpdateDate: true, name: 'updated_at' })
  public updatedAt: Date

  @Column({ isDeleteDate: true })
  public deletedAt: Date
}
