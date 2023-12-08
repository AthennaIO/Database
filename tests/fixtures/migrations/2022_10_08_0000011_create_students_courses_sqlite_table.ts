/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, BaseMigration } from '#src'

export class StudentCourseMigration extends BaseMigration {
  public static connection() {
    return 'sqlite-memory'
  }

  public tableName = 'students_courses'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')

      table.integer('courseId').references('id').inTable('courses')
      table.integer('studentId').references('id').inTable('students')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
