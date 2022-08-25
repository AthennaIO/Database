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
import { DataSource, SelectQueryBuilder } from 'typeorm'

import { Database } from '#src/index'
import { User } from '#tests/Stubs/models/User'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('DatabaseTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    await User.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should be able to get the driver client from the connections', async ({ assert }) => {
    const client = Database.getClient()

    assert.instanceOf(client, DataSource)
  })

  test('should be able to get the internal query builder of driver', async ({ assert }) => {
    const query = Database.query()

    assert.instanceOf(query, SelectQueryBuilder)
  })

  test('should be able to create and list tables/databases', async ({ assert }) => {
    await Database.createDatabase('testing')
    await Database.createTable('testing', {})

    const tables = await Database.getTables()

    assert.isTrue(tables.includes('users'))
    assert.isTrue(tables.includes('testing'))

    assert.isTrue(await Database.hasTable('testing'))
    assert.isTrue(await Database.hasDatabase('testing'))
    assert.deepEqual(await Database.getCurrentDatabase(), 'postgres')

    await Database.dropTable('testing')
    await Database.dropDatabase('testing')
  }).timeout(10000)

  test('should be able to create user and users', async ({ assert }) => {
    const user = await Database.buildTable('users').create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await Database.buildTable('users').createMany([
      { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await Database.buildTable('users').buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)

    const users = await Database.buildTable('users').buildWhereIn('id', [1, 2]).buildOrderBy('id', 'DESC').findMany()

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[1].id, 1)
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await Database.buildTable('users')
      .buildWhereIn('id', [1, 2])
      .buildOrderBy('id', 'DESC')
      .paginate()

    assert.lengthOf(data, 2)
    assert.deepEqual(meta.itemCount, 2)
    assert.deepEqual(meta.totalItems, 2)
    assert.deepEqual(meta.totalPages, 1)
    assert.deepEqual(meta.currentPage, 0)
    assert.deepEqual(meta.itemsPerPage, 10)

    assert.deepEqual(links.first, '/?limit=10')
    assert.deepEqual(links.previous, '/?page=0&limit=10')
    assert.deepEqual(links.next, '/?page=1&limit=10')
    assert.deepEqual(links.last, '/?page=1&limit=10')
  })

  test('should be able to update user and users', async ({ assert }) => {
    const user = await Database.buildTable('users').buildWhere('id', 1).update({ name: 'João Lenon Updated' })

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const users = await Database.buildTable('users').buildWhereIn('id', [1, 2]).update({ name: 'João Lenon Updated' })

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 1)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, 2)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should be able to delete user and users', async ({ assert }) => {
    await Database.buildTable('users').buildWhere('id', 3).delete()

    const notFoundUser = await Database.buildTable('users').buildWhere('id', 3).find()

    assert.isNull(notFoundUser)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const trx = await Database.buildTable('users').startTransaction()

    await trx.buildWhereIn('id', [1, 2]).delete()

    assert.isEmpty(await trx.buildWhereIn('id', [1, 2]).findMany())

    await trx.rollbackTransaction()

    assert.isNotEmpty(await Database.buildTable('users').buildWhereIn('id', [1, 2]).findMany())
  })
})
