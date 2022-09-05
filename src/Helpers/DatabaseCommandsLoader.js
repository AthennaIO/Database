import { join } from 'node:path'
import { Folder, Module } from '@secjs/utils'

export class DatabaseCommandsLoader {
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
