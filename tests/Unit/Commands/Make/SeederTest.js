/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Artisan } from '@athenna/artisan'
import { File, Path } from '@athenna/common'
import { TestHooks } from '#tests/Helpers/TestHooks'

test.group('MakeSeederTest', group => {
  group.each.setup(TestHooks.command.setup)
  group.each.teardown(TestHooks.command.teardown)

  test('should be able to create a seeder file', async ({ assert }) => {
    await Artisan.call('make:seeder User')

    const path = Path.seeders('User.js')

    assert.isTrue(await File.exists(path))
  }).timeout(60000)

  test('should throw an error when the file already exists', async ({ assert }) => {
    await Artisan.call('make:seeder User')
    await Artisan.call('make:seeder User')
  }).timeout(60000)
})
