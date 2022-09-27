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

import { Database, Migration } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { NotImplementedMigrationException } from '#src/Exceptions/NotImplementedMigrationException'

test.group('MigrationTest', group => {
  /** @type {import('#src/index').DatabaseImpl} */
  let DB = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    DB = await Database.connection('mysql').connect()
  })

  group.each.teardown(async () => {
    await DB.dropTable('products')
    await DB.dropTable('users')
    await DB.dropTable('migrations')
    await DB.dropTable('migrations_lock')
    await DB.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should throw not implemented migration exception in up method', async ({ assert }) => {
    const migration = new Migration()

    assert.throws(() => migration.up(), NotImplementedMigrationException)
  })

  test('should throw not implemented migration exception in down', async ({ assert }) => {
    const migration = new Migration()

    assert.throws(() => migration.down(), NotImplementedMigrationException)
  })

  test('should be able to run migration using mysql connection', async ({ assert }) => {
    await DB.runMigrations()

    assert.isTrue(await DB.hasTable('users'))
    assert.isTrue(await DB.hasTable('products'))
    assert.isTrue(await DB.hasTable(Config.get('database.migrations')))
  })

  test('should be able to revert migration using mysql connection', async ({ assert }) => {
    await DB.revertMigrations()

    assert.isFalse(await DB.hasTable('users'))
    assert.isFalse(await DB.hasTable('products'))
    assert.isTrue(await DB.hasTable(Config.get('database.migrations')))
  })
})
