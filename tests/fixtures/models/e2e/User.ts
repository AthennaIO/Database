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
import { HasOne } from '#src/models/annotations/HasOne'
import { Profile } from '#tests/fixtures/models/e2e/Profile'

export class User extends Model {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @HasOne(() => Profile)
  public profile: Profile

  @Column({ isCreateDate: true })
  public createdAt: Date

  @Column({ isUpdateDate: true })
  public updatedAt: Date

  @Column({ isDeleteDate: true })
  public deletedAt: Date
}
