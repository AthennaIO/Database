/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { DriverFactory } from '#src/factories/DriverFactory'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()
new DatabaseProvider().register()

await Config.loadAll(Path.fixtures('config'))

DriverFactory.drivers.set('fake', { Driver: FakeDriverClass, client: null })

Path.mergeDirs({
  app: 'tests/fixtures/storage/app',
  seeders: 'tests/fixtures/storage/database/seeders',
  migrations: 'tests/fixtures/storage/database/migrations'
})

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
