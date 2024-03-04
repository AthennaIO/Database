/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Rc, Config } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Rc.setFile(Path.pwd('package.json'))
Config.set('rc.commands.make:model.destination', './tests/fixtures/storage/models')
Config.set('rc.commands.make:seeder.destination', './tests/fixtures/storage/seeders')
Config.set('rc.commands.make:migration.destination', './tests/fixtures/storage/migrations')

Path.mergeDirs({
  models: 'tests/fixtures/storage/app/models',
  seeders: 'tests/fixtures/storage/database/seeders',
  migrations: 'tests/fixtures/storage/database/migrations'
})

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
