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
import { Course } from '#tests/fixtures/models/e2e/Course'
import { BelongsToMany } from '#src/models/annotations/BelongsToMany'
import { StudentsCourses } from '#tests/fixtures/models/e2e/StudentsCourses'

export class Student extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @BelongsToMany(() => Course, () => StudentsCourses)
  public courses: Relation<Course[]>
}
