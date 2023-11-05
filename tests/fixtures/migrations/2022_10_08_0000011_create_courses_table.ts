import { DatabaseImpl, Migration } from '#src'

export class CourseMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'courses'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.uuid('id').primary().defaultTo(db.raw('(UUID())'))
      table.string('name')
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
