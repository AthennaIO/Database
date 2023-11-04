import { DatabaseImpl, Migration } from '#src'

export class UuidFunctionMigration extends Migration {
  public static connection() {
    return 'postgres-docker'
  }

  public async up(db: DatabaseImpl) {
    return db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  public async down() {}
}
