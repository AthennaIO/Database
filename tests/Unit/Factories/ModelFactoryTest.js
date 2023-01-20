/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Folder, Path } from '@athenna/common'

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Database } from '#src/index'
import { User } from '#tests/Stubs/models/User'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('ModelFactoryTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.closeAll()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to make/create one user', async ({ assert }) => {
    const userMake = await User.factory().count(1).make()
    const userCreate = await User.factory().count(1).create()

    assert.isUndefined(await User.find({ id: userMake.id }))
    assert.isDefined(await User.find({ id: userCreate.id }))
  })

  test('should be able to make/create many users', async ({ assert }) => {
    const usersMake = await User.factory().count(10).make()
    const usersCreate = await User.factory().count(10).create()

    assert.isUndefined(await User.find({ id: usersMake[0].id }))
    assert.isDefined(await User.find({ id: usersCreate[0].id }))
  })
})
