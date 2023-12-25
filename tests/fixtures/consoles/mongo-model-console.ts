/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ViewProvider } from '@athenna/view'
import { Rc, Config } from '@athenna/config'
import { DriverFactory } from '#src/factories/DriverFactory'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()
new DatabaseProvider().register()

await Config.loadAll(Path.fixtures('config'))

Rc.setFile(Path.pwd('package.json'))
DriverFactory.drivers.set('fake', { Driver: FakeDriverClass, client: null })

Config.set('database.default', 'mongo')
Config.set('database.connections.mongo.driver', 'mongo')

Path.mergeDirs({
  models: 'tests/fixtures/storage/app/models',
  seeders: 'tests/fixtures/storage/database/seeders',
  migrations: 'tests/fixtures/storage/database/migrations'
})

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
