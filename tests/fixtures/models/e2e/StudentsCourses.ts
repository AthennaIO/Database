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
import { BelongsTo } from '#src/models/annotations/BelongsTo'
import { type Course } from '#tests/fixtures/models/e2e/Course'
import { type Student } from '#tests/fixtures/models/e2e/Student'

export class StudentsCourses extends BaseModel {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public courseId: number

  @BelongsTo('Course')
  public course: Course

  @Column()
  public studentId: number

  @BelongsTo('Student')
  public student: Student
}
