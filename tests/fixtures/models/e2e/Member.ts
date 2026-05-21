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
import { Article } from '#tests/fixtures/models/e2e/Article'

export class Member extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @Column()
  public regionId: number

  @HasMany(() => Article)
  public articles: Relation<Article[]>
}
