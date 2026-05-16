/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { ViewProvider } from '@athenna/view'
import { Rc, Config } from '@athenna/config'
import { FakeDriver } from '#src/database/drivers/FakeDriver'
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

switch (process.env.MOCK_RAW_TYPE) {
  case 'array':
    FakeDriver.raw = () => [{ id: 1, name: 'Lenon' }] as any
    break
  case 'number':
    FakeDriver.raw = () => 42 as any
    break
  case 'string':
    FakeDriver.raw = () => 'hello' as any
    break
  case 'boolean':
    FakeDriver.raw = () => true as any
    break
  case 'undefined':
    FakeDriver.raw = () => undefined as any
    break
  case 'throw':
    FakeDriver.raw = () => {
      throw new Error('Syntax error near token "FROOM"')
    }
    break
}

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
