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
      import('#src/Commands/Make/Model'),
      import('#src/Commands/Make/Seeder'),
      import('#src/Commands/Make/Migration'),
    ]
  }

  /**
   * Return all custom templates from test package.
   *
   * @return {any[]}
   */
  static loadTemplates() {
    return new Folder(
      join(Module.createDirname(import.meta.url), '..', '..', 'templates'),
    ).loadSync().files
  }
}
