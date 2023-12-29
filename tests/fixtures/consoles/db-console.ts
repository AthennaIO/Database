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
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()
new DatabaseProvider().register()

await Config.loadAll(Path.fixtures('config'))

Rc.setFile(Path.pwd('package.json'))

Path.mergeDirs({
  seeders: 'tests/fixtures/database/seeders',
  migrations: 'tests/fixtures/database/migrations'
})

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
