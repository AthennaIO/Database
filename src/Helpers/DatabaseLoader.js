/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { Folder, Module, Path } from '@secjs/utils'

export class DatabaseLoader {
  /**
   * Return all commands from test package.
   *
   * @return {any[]}
   */
  static loadCommands() {
    return [
      import('#src/Commands/Db/Seed'),
      import('#src/Commands/Db/Wipe'),
      import('#src/Commands/Make/Model'),
      import('#src/Commands/Make/Seeder'),
      import('#src/Commands/Make/Resource'),
      import('#src/Commands/Make/Migration'),
      import('#src/Commands/Migration/Revert'),
      import('#src/Commands/Migration/Run'),
    ]
  }

  /**
   * Return all custom templates from test package.
   *
   * @return {any[]}
   */
  static loadTemplates() {
    const dirname = Module.createDirname(import.meta.url)
    const templatesPath = join(dirname, '..', '..', 'templates')

    return new Folder(templatesPath).loadSync().getFilesByPattern('**/*.ejs')
  }

  /**
   * Get the schema of all models with same connection.
   *
   * @param connection {string}
   * @param [path] {string}
   * @param [defaultConnection] {string}
   * @return {Promise<any[]>}
   */
  static async loadEntities(
    connection,
    path = Path.app('Models'),
    defaultConnection = process.env.DB_CONNECTION,
  ) {
    const schemas = []

    const Models = await Module.getAllFrom(path)

    Models.forEach(Model => {
      const modelConnection = Model.connection

      if (modelConnection === 'default' && connection === defaultConnection) {
        schemas.push(Model.getSchema())
      }

      if (modelConnection === connection) {
        schemas.push(Model.getSchema())
      }
    })

    return schemas
  }
}
