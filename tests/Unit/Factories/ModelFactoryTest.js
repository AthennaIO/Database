/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Path, Folder, Config } from '@secjs/utils'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Database } from '#src/index'
import { User } from '#tests/Stubs/models/User'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('ModelFactoryTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should be able to make/create one user', async ({ assert }) => {
    const userMake = await User.factory().count(1).make()
    const userCreate = await User.factory().count(1).create()

    await User.assertNotExists({ id: userMake.id })
    await User.assertExists({ id: userCreate.id })
  })

  test('should be able to make/create many users', async ({ assert }) => {
    const usersMake = await User.factory().count(10).make()
    const usersCreate = await User.factory().count(10).create()

    await User.assertNotExists({ id: usersMake[0].id })
    await User.assertExists({ id: usersCreate[0].id })
  })
})
