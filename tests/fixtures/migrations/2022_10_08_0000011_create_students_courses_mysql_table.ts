/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl, Migration } from '#src'

export class StudentCourseMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'students_courses'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')

      table.integer('courseId').unsigned().index().references('id').inTable('courses')
      table.integer('studentId').unsigned().index().references('id').inTable('students')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
