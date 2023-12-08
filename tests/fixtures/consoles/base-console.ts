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
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Path.mergeDirs({
  app: 'tests/fixtures/storage/app',
  seeders: 'tests/fixtures/storage/database/seeders',
  migrations: 'tests/fixtures/storage/database/migrations'
})

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
