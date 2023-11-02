/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@athenna/common'
import { DatabaseImpl } from '#src/database/DatabaseImpl'
import { DriverFactory } from '#src/factories/DriverFactory'
import type { Migration } from '#src/database/migrations/Migration'

type Source = {
  name: string
  Migration: new (...args: any[]) => Migration
}

export class MigrationSource {
  public connection = null

  public constructor(connection: string) {
    this.connection = connection
  }

  /**
   * Verify if migration is able to run by connection.
   */
  private isAbleToRun(migration: typeof Migration): boolean {
    return migration.connection() === this.connection
  }

  /**
   * Get all the migrations from migrations path and import
   * as modules. This method will be used by "getMigration"
   * method later to get the migrations "up"/"down" methods.
   */
  public async getMigrations(): Promise<Source[]> {
    const migrations = []
    const files = await Module.getAllJSFilesFrom(Path.migrations())

    for (const file of files) {
      const Migration = await Module.getFrom(file.path)

      if (this.isAbleToRun(Migration)) {
        migrations.push({ name: file.base, Migration })
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

    database.connectionName = connection
    database.driver = DriverFactory.fabricate(connection)

    const proxyfy = method => {
      return new Proxy(method, {
        apply: function (fn, _, args) {
          database.driver = database.driver.setClient(args[0])

          return fn.apply(migration, [database])
        }
      })
    }

    /**
     * Wrap `up`/`down` methods to change knex client by
     * Database instance using the knex client provided
     * in fn arguments.
     */
    return {
      up: proxyfy(migration.up),
      down: proxyfy(migration.down)
    }
  }
}
