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

test.group('MigrationRunTest', group => {
  group.each.setup(TestHooks.commandWithDb.setup)
  group.each.teardown(TestHooks.commandWithDbMigrations.teardown)

  test('should be able to run database migrations', async ({ assert }) => {
    assert.isFalse(await Database.hasTable('users'))

    await Artisan.call('migration:run')

    await Database.connect()

    assert.isTrue(await Database.hasTable('users'))
  }).timeout(60000)
})
