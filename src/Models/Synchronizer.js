/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module, Path } from '@secjs/utils'

export class Synchronizer {
  /**
   * Sync all the models of connection.
   *
   * @param {string} connection
   * @param {string} path
   */
  static async sync(connection, path = Path.app('Models')) {
    const schemas = await this.#getSchemas(connection, path)

    await Promise.all(schemas.map(schema => schema.sync()))
  }

  /**
   * Get the models schema by connection.
   *
   * @param {string} connection
   * @param {string} path
   * @return {Promise<import('#src/Builders/SchemaBuilder').SchemaBuilder[]>}
   */
  static async #getSchemas(connection, path) {
    const schemas = []
    const files = await Module.getAllJSFilesFrom(path)

    for (const file of files) {
      const Model = await Module.getFrom(file.path)

      schemas.push(Model.getSchema())
    }

    return schemas.filter(
      schema => schema.synchronize && schema.connection === connection,
    )
  }
}
