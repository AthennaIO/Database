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

import { Database } from '#src/index'
import { DriverFactory } from '#src/Factories/DriverFactory'

test.group('PostgresDriverTest', group => {
  /** @type {Database} */
  let database = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())

    await new Config().safeLoad(Path.config('database.js'))

    database = new Database()
  })

  group.teardown(async () => {
    await database.dropTable('users')
    await database.close()

    await Folder.safeRemove(Path.config())
  })

  test('should be able to connect to database', async ({ assert }) => {
    await database.connection('postgres').connect()

    assert.deepEqual(['postgres'], DriverFactory.availableDrivers(true))
  })

  test('should be able to create and drop tables', async () => {
    const options = {
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          generationStrategy: 'increment',
        },
        {
          name: 'name',
          type: 'varchar',
        },
        {
          name: 'email',
          isUnique: true,
          type: 'varchar',
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
          default: null,
        },
      ],
    }

    await database.createTable('users', options)
    await database.dropTable('users')

    /**
     * Create again to continue testing.
     */
    await database.createTable('users', options)

    database.buildTable('users')
  })

  test('should be able to list tables and databases', async ({ assert }) => {
    const tables = await database.getTables()
    const databases = await database.getDatabases()

    assert.deepEqual(databases, ['postgres'])
    assert.deepEqual(tables[0], 'pg_catalog.pg_statistic')
  })

  test('should be able to create user and users', async ({ assert }) => {
    const user = await database.create({
      id: 1,
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await database.createMany([
      { id: 2, name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { id: 3, name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[1].id, 3)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await database.buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon')

    const users = await database.buildWhereIn('id', [1, 2]).buildOrderBy('id', 'DESC').findMany()

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[1].id, 1)
  })

  test('should be able to update user and users', async ({ assert }) => {
    const [user] = await database.buildWhere('id', 1).update({ name: 'João Lenon Updated' })

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const users = await database.buildWhereIn('id', [1, 2]).update({ name: 'João Lenon Updated' })

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 1)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, 2)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should be able to delete/softDelete user and users', async ({ assert }) => {
    await database.buildWhere('id', 3).delete()

    const notFoundUser = await database.buildWhere('id', 3).find()

    assert.isUndefined(notFoundUser)

    await database.buildWhereIn('id', [1, 2]).delete(true)

    const users = await database.buildWhereIn('id', [1, 2]).findMany()

    assert.lengthOf(users, 2)

    assert.deepEqual(users[0].id, 1)
    assert.isDefined(users[0].deletedAt)

    assert.deepEqual(users[1].id, 2)
    assert.isDefined(users[1].deletedAt)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const trx = await database.startTransaction()

    await trx.buildWhereIn('id', [1, 2]).delete()

    assert.isEmpty(await trx.buildWhereIn('id', [1, 2]).findMany())

    await trx.rollbackTransaction()

    assert.isNotEmpty(await database.buildWhereIn('id', [1, 2]).findMany())
  })
})
