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
import { Folder, Path } from '@athenna/common'

import { TestHooks } from '#tests/Helpers/TestHooks'

test.group('MakeMigrationTest', group => {
  group.each.setup(TestHooks.command.setup)
  group.each.teardown(TestHooks.command.teardown)

  test('should be able to create a migration file', async ({ assert }) => {
    await Artisan.call('make:migration User')

    const path = Path.migrations()
    const folder = await new Folder(path).load()

    assert.isDefined(folder.files.find(file => file.name.includes('create_users_table')))
  }).timeout(60000)

  test('should throw an error when the file already exists', async ({ assert }) => {
    await Artisan.call('make:migration User')
    await Artisan.call('make:migration User')
  }).timeout(60000)
})
