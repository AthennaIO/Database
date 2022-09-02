/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config, File, Folder, Path } from '@secjs/utils'

import { Artisan } from '@athenna/artisan'
import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'

test.group('MakeSeederTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('configs')).copy(Path.config())

    await new Config().safeLoad(Path.config('app.js'))
    await new Config().safeLoad(Path.config('logging.js'))
    await new Config().safeLoad(Path.config('database.js'))

    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new Kernel()

    await kernel.registerCommands()
    await kernel.registerErrorHandler()
    await kernel.registerCustomTemplates()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to create a seeder file', async ({ assert }) => {
    await Artisan.call('make:seeder User')

    const path = Path.seeders('UserSeeder.js')

    assert.isTrue(await File.exists(path))
  }).timeout(60000)

  test('should throw an error when the file already exists', async ({ assert }) => {
    await Artisan.call('make:seeder User')
    await Artisan.call('make:seeder User')
  }).timeout(60000)
})
