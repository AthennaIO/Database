/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Folder, Path } from '@athenna/common'

import { Database } from '#src/index'
import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'
import { TemplateProvider } from '@athenna/artisan/providers/TemplateProvider'

export class TestHooks {
  static get command() {
    return {
      setup: async () => {
        await new Folder(Path.stubs('app')).copy(Path.app())
        await new Folder(Path.stubs('configs')).copy(Path.config())

        await Config.safeLoad(Path.config('app.js'))
        await Config.safeLoad(Path.config('logging.js'))
        await Config.safeLoad(Path.config('database.js'))

        new LoggerProvider().register()
        new ArtisanProvider().register()
        new TemplateProvider().register()

        const kernel = new Kernel()

        await kernel.registerCommands()
        await kernel.registerErrorHandler()
        await kernel.registerTemplates()
      },
      teardown: async () => {
        await Folder.safeRemove(Path.app())
        await Folder.safeRemove(Path.config())
        await Folder.safeRemove(Path.database())
      },
    }
  }

  static get commandWithDb() {
    return {
      setup: async () => {
        await new Folder(Path.stubs('app')).copy(Path.app())
        await new Folder(Path.stubs('configs')).copy(Path.config())
        await new Folder(Path.stubs('database')).copy(Path.database())

        await Config.safeLoad(Path.config('app.js'))
        await Config.safeLoad(Path.config('logging.js'))
        await Config.safeLoad(Path.config('database.js'))

        new LoggerProvider().register()
        new ArtisanProvider().register()
        new TemplateProvider().register()
        await new DatabaseProvider().boot()

        await Database.connect()

        const kernel = new Kernel()

        await kernel.registerCommands()
        await kernel.registerErrorHandler()
        await kernel.registerTemplates()
      },
      teardown: async () => {
        await Folder.safeRemove(Path.app())
        await Folder.safeRemove(Path.config())
        await Folder.safeRemove(Path.database())

        await Database.close()
      },
    }
  }

  static get commandWithDbMigrations() {
    return {
      setup: async () => {
        await new Folder(Path.stubs('app')).copy(Path.app())
        await new Folder(Path.stubs('configs')).copy(Path.config())
        await new Folder(Path.stubs('database')).copy(Path.database())

        await Config.safeLoad(Path.config('app.js'))
        await Config.safeLoad(Path.config('logging.js'))
        await Config.safeLoad(Path.config('database.js'))

        new LoggerProvider().register()
        new ArtisanProvider().register()
        new TemplateProvider().register()
        await new DatabaseProvider().boot()

        await Database.connect()
        await Database.runMigrations()

        const kernel = new Kernel()

        await kernel.registerCommands()
        await kernel.registerErrorHandler()
        await kernel.registerTemplates()
      },
      teardown: async () => {
        await Database.revertMigrations()
        await Database.close()

        await Folder.safeRemove(Path.app())
        await Folder.safeRemove(Path.config())
        await Folder.safeRemove(Path.database())
      },
    }
  }
}
