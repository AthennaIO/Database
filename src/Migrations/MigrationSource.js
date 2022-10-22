/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Module, Path } from '@athenna/common'

export class MigrationSource {
  #connection = null

  /**
   * Creates a new instance of MigrationSource.
   *
   * @param connection {string}
   * @return {MigrationSource}
   */
  constructor(connection) {
    this.#connection = connection
  }

  /**
   * Verify if migration is able to run by connection.
   *
   * @param migration {any}
   * @return {boolean}
   */
  #isAbleToRun(migration) {
    const defaultConnection = Config.get('database.default')

    const isDefaultConnection =
      migration.connection === 'default' &&
      this.#connection === defaultConnection

    const isSameConnection = migration.connection === this.#connection

    return isDefaultConnection || isSameConnection
  }

  /**
   * Get all the migrations from migrations path and import
   * as modules. This method will be used by "getMigration"
   * method later to get the migrations "up"/"down" methods.
   *
   * @return {Promise<{name: string, Migration: any}[]>}
   */
  async getMigrations() {
    const migrations = []
    const files = await Module.getAllJSFilesFrom(Path.migrations())

    for (const file of files) {
      const Migration = await Module.getFrom(file.path)

      if (this.#isAbleToRun(Migration)) {
        migrations.push({ name: file.base, Migration })
      }
    }

    return migrations
  }

  /**
   * Get the migration name that will be used to set in
   * migrations table.
   *
   * @param migration {{name: string, Migration: any}}
   * @return {string}
   */
  getMigrationName({ name }) {
    return name
  }

  /**
   * Creates a new migration instance and return the up/down
   * methods in object.
   *
   * @param migration {{name: string, Migration: any}}
   * @return {Promise<{up: any, down: any}>}
   */
  async getMigration({ Migration }) {
    const migration = new Migration()

    return {
      up: migration.up,
      down: migration.down,
    }
  }
}
