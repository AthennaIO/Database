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
import { Member } from '#tests/fixtures/models/e2e/Member'
import { Article } from '#tests/fixtures/models/e2e/Article'
import { HasOneThrough } from '#src/models/annotations/HasOneThrough'
import { HasManyThrough } from '#src/models/annotations/HasManyThrough'

export class Region extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @HasMany(() => Member)
  public members: Relation<Member[]>

  @HasManyThrough(() => Article, () => Member)
  public articles: Relation<Article[]>

  @HasOneThrough(() => Article, () => Member)
  public latestArticle: Relation<Article | null>
}
