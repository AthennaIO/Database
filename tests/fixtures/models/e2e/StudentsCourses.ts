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
import { Course } from '#tests/fixtures/models/e2e/Course'
import { Student } from '#tests/fixtures/models/e2e/Student'
import { BelongsTo } from '#src/models/annotations/BelongsTo'

export class StudentsCourses extends Model {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public courseId: number

  @BelongsTo(() => Course)
  public course: Course

  @Column()
  public studentId: number

  @BelongsTo(() => Student)
  public student: Student
}
