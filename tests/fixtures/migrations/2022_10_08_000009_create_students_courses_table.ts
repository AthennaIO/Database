import { DatabaseImpl, Migration } from '#src'

export class StudentCourseMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'students_courses'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.uuid('id').primary().defaultTo(db.raw('(UUID())'))

      table.uuid('courseId').references('id').inTable('courses')
      table.uuid('studentId').references('id').inTable('students')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
