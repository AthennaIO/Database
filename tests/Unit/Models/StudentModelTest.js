/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { test } from '@japa/runner'
import { Config, Folder, Path } from '@secjs/utils'

import { DB } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { Capital } from '#tests/Stubs/models/Capital'

test.group('StudentModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await DB.connection('mysql').connect()
    await DB.connection('mysql').runMigrations()

    await Capital.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await DB.connection('mysql').revertMigrations()
    await DB.connection('mysql').close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  // TODO Implement
  test('should be able to load courses relation of student', async ({ assert }) => {})

  // TODO Implement
  test('should be able to make sub queries on relations', async ({ assert }) => {})
})
