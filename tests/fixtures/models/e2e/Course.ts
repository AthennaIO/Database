/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import { Student } from '#tests/fixtures/models/e2e/Student'
import { Column } from '#src/models/annotations/Column'
import { BelongsToMany } from '#src/models/annotations/BelongsToMany'

export class Course extends Model {
  public static connection() {
    return 'postgres-docker'
  }

  @Column()
  public id: number

  @Column()
  public name: string

  @BelongsToMany(() => Student, { pivotTable: 'students_courses' })
  public students: Student[]
}
