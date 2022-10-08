/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder, Module } from '@secjs/utils'
import { join } from 'node:path'

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
}
