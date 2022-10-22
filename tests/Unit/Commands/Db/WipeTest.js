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

import { User } from '#tests/Stubs/models/User'
import { TestHooks } from '#tests/Helpers/TestHooks'

test.group('DbWipeTest', group => {
  group.each.setup(TestHooks.commandWithDbMigrations.setup)
  group.each.teardown(TestHooks.commandWithDbMigrations.teardown)

  test('should be able to wipe all database data', async ({ assert }) => {
    await User.factory().count(10).create()
    const data = await Database.table('users').find()

    assert.isDefined(data)

    await Artisan.call('db:wipe')

    await Database.connect()

    assert.isFalse(await Database.hasTable('users'))
  }).timeout(60000)
})
