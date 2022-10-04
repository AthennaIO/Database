/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config, Folder, Path } from '@secjs/utils'

import { Database } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { Artisan } from '@athenna/artisan'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

test.group('DbSeedTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())

    await new Config().safeLoad(Path.config('app.js'))
    await new Config().safeLoad(Path.config('logging.js'))
    await new Config().safeLoad(Path.config('database.js'))

    new LoggerProvider().register()
    new ArtisanProvider().register()
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    const kernel = new Kernel()

    await kernel.registerCommands()
    await kernel.registerErrorHandler()
    await kernel.registerTemplates()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to run database seeders', async ({ assert }) => {
    await Database.truncate('users')
    const data = await Database.table('users').find()

    assert.isUndefined(data)

    await Artisan.call('db:seed')

    await Database.connect()

    const user = await Database.table('users').find()

    assert.isDefined(user)
  }).timeout(60000)

  test('should be able to run only one database seeder', async ({ assert }) => {
    await Database.truncate('users')
    const data = await Database.table('users').find()

    assert.isUndefined(data)

    await Artisan.call('db:seed --class=UserSeeder')

    await Database.connect()

    const user = await Database.table('users').find()

    assert.isDefined(user)
  }).timeout(60000)
})
