/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Mock } from '@athenna/test'
import { Path } from '@athenna/common'
import { ViewProvider } from '@athenna/view'
import { Rc, Config } from '@athenna/config'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Artisan, ConsoleKernel, ArtisanProvider, Prompt } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()
new DatabaseProvider().register()

await Config.loadAll(Path.fixtures('config'))

Rc.setFile(Path.pwd('package.json'))

Path.mergeDirs({
  routes: 'tests/fixtures/storage/routes',
  models: 'tests/fixtures/storage/app/models',
  seeders: 'tests/fixtures/storage/database/seeders',
  migrations: 'tests/fixtures/storage/database/migrations',
  services: 'tests/fixtures/storage/app/services',
  controllers: 'tests/fixtures/storage/app/http/controllers',
  tests: 'tests/fixtures/storage/tests'
})

await new ConsoleKernel().registerCommands()

Config.set('rc.commands.make:crud', {
  path: '#src/commands/MakeCrudCommand',
  fileCase: 'toDotCase'
})

Mock.when(Prompt.prototype, 'confirm')
  .onFirstCall()
  .resolve(true)
  .onSecondCall()
  .resolve(true)
  .onThirdCall()
  .resolve(true)
  .onCall(4)
  .resolve(true)
  .onCall(5)
  .resolve(false)

Mock.when(Prompt.prototype, 'input').resolve('name')
Mock.when(Prompt.prototype, 'list').resolve('string')
Mock.when(Prompt.prototype, 'checkbox').resolve(['isUnique', 'notNullable'])

await Artisan.parse(process.argv)
