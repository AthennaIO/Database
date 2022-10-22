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

test.group('MigrationRevertTest', group => {
  group.each.setup(TestHooks.commandWithDb.setup)
  group.each.teardown(TestHooks.commandWithDb.teardown)

  test('should be able to revert database migrations', async ({ assert }) => {
    await Database.runMigrations()

    await Artisan.call('migration:revert')

    await Database.connect()

    assert.isFalse(await Database.hasTable('users'))
  }).timeout(60000)
})
