/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { Module, Path } from '@athenna/common'
import { DatabaseImpl } from '#src/database/DatabaseImpl'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import type { BaseMigration } from '#src/database/migrations/BaseMigration'

type Source = {
  name: string
  Migration: new (...args: any[]) => BaseMigration
}

export class MigrationSource {
  public connection = null

  public constructor(connection: string) {
    this.connection = connection
  }

  /**
   * Verify if migration is able to run by connection.
   */
  private isAbleToRun(migration: typeof BaseMigration): boolean {
    return migration.connection() === this.connection
  }

  /**
   * Get all the migrations from migrations path and import
   * as modules. This method will be used by "getMigration"
   * method later to get the migrations "up"/"down" methods.
   *
   * The migration name is registered without the file extension
   * to keep the same name between the source code (".ts") and the
   * compiled code (".js"). Otherwise the same migration would be
   * registered twice in the migrations table.
   */
  public async getMigrations(): Promise<Source[]> {
    const migrations = []
    const files = await Module.getAllJSFilesFrom(Path.migrations())

    for (const file of files) {
      const Migration = await Module.getFrom(file.path)

      if (this.isAbleToRun(Migration)) {
        migrations.push({ name: file.name, Migration })
      }
    }

    return migrations
  }

  /**
   * Get the migration name that will be used to set in
   * migrations table.
   */
  public getMigrationName(source: Source): string {
    return source.name
  }

  /**
   * Creates a new migration instance and return the up/down
   * methods in object.
   */
  public async getMigration(source: Source) {
    const migration = new source.Migration()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const connection = source.Migration.connection()
    const database = new DatabaseImpl({ connect: false })

    debug(
      'configuring database connection %s to run migration %s',
      connection,
      source.Migration.name
    )

    database.connectionName = connection
    database.driver = ConnectionFactory.fabricate(connection)

    const bind = (method, knex) => {
      database.driver = database.driver.setClient(knex)

      return migration[method].bind(migration)(database)
    }

    return {
      up: knex => bind('up', knex),
      down: knex => bind('down', knex)
    }
  }
}
