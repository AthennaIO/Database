import { DatabaseImpl, Migration } from '#src'

export class UserMigration extends Migration {
  public static connection() {
    return 'mysql-docker'
  }

  public tableName = 'users'

  public async up(db: DatabaseImpl) {
    return db.createTable(this.tableName, table => {
      table.increments('id')
      table.string('name')
      table.string('email').unique()
      table.timestamps(true, true, true)
      table.dateTime('deletedAt').nullable().defaultTo(null)
    })
  }

  public async down(db: DatabaseImpl) {
    return db.dropTable(this.tableName)
  }
}
