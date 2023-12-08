/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel } from '#src/models/BaseModel'
import { User } from '#tests/fixtures/models/e2e/User'
import { Column } from '#src/models/annotations/Column'
import { BelongsTo } from '#src/models/annotations/BelongsTo'

export class Profile extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public userId: number

  @BelongsTo(() => User)
  public user: User

  @Column({ isCreateDate: true })
  public createdAt: Date

  @Column({ isUpdateDate: true })
  public updatedAt: Date

  @Column({ isDeleteDate: true })
  public deletedAt: Date
}
