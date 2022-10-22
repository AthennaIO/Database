/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { Database } from '#src/index'
import { Artisan } from '@athenna/artisan'
import { TestHooks } from '#tests/Helpers/TestHooks'

test.group('DbSeedTest', group => {
  group.each.setup(TestHooks.commandWithDbMigrations.setup)
  group.each.teardown(TestHooks.commandWithDbMigrations.teardown)

  test('should be able to run database seeders', async ({ assert }) => {
    await Database.truncate('users')
    const data = await Database.table('users').find()

    assert.isUndefined(data)

    await Artisan.call('db:seed')

    await Database.connect()

    const user = await Database.table('users').find()

    assert.isDefined(user)
  }).timeout(60000)

  test('should be able to run only one database seeder', async ({ assert }) => {
    await Database.truncate('users')
    const data = await Database.table('users').find()

    assert.isUndefined(data)

    await Artisan.call('db:seed --class=UserSeeder')

    await Database.connect()

    const user = await Database.table('users').find()

    assert.isDefined(user)
  }).timeout(60000)
})
