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
import { Product } from '#tests/Stubs/models/Product'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NoTableSelectedException } from '#src/Exceptions/NoTableSelectedException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'

test.group('PostgresDriverTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    const [user] = await User.factory().count(10).create()
    await Product.factory().count(5).create({ userId: user.id })
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should throw not connected database exception', async ({ assert }) => {
    await Database.close()

    assert.throws(() => Database.query(), NotConnectedDatabaseException)

    await Database.connect()
  })

  test('should be able to get the driver client from the connections', async ({ assert }) => {
    const client = Database.getClient()

    assert.instanceOf(client, DataSource)
  })

  test('should be able to get the internal query builder of driver', async ({ assert }) => {
    const query = Database.query()

    assert.instanceOf(query, SelectQueryBuilder)
  })

  test('should throw a no table selected exception when not selecting the table', async ({ assert }) => {
    assert.throws(() => Database.query(true), NoTableSelectedException)
  })

  test('should be able to create and list tables/databases', async ({ assert }) => {
    await Database.createDatabase('testing')
    await Database.createTable('testing', {
      columns: [{ name: 'id', type: 'int' }],
    })

    const tables = await Database.getTables()

    assert.isTrue(tables.includes('users'))
    assert.isTrue(tables.includes('testing'))

    assert.isDefined(await Database.getDatabases())
    assert.isTrue(await Database.hasTable('testing'))
    assert.isTrue(await Database.hasDatabase('testing'))
    assert.deepEqual(await Database.getCurrentDatabase(), 'postgres')

    await Database.dropDatabase('testing')
  })

  test('should be able to take truncate table data', async ({ assert }) => {
    const users = await Database.buildTable('users').findMany()

    assert.lengthOf(users, 10)

    await Database.truncate('users')

    assert.lengthOf(await Database.buildTable('users').findMany(), 0)
  })

  test('should be able to get avg/avgDistinct from int values in table column', async ({ assert }) => {
    const avg = await Database.buildTable('products').avg('price')
    const avgDistinct = await Database.buildTable('products').avgDistinct('price')

    assert.isNumber(avg)
    assert.isNumber(avgDistinct)
  })

  test('should be able to get min/max values in table column', async ({ assert }) => {
    const min = await Database.buildTable('products').min('price')
    const max = await Database.buildTable('products').max('price')

    assert.isNumber(min)
    assert.isNumber(max)
  })

  test('should be able to sum/sumDistinct from int values in table column', async ({ assert }) => {
    const sum = await Database.buildTable('products').sum('price')
    const sumDistinct = await Database.buildTable('products').sumDistinct('price')

    assert.isNumber(sum)
    assert.isNumber(sumDistinct)
  })

  test('should be able to increment/decrement values in table column', async ({ assert }) => {
    const DB = Database.buildTable('products')

    const increment = await DB.increment('price')
    const decrement = await DB.decrement('price')

    increment.forEach(i => assert.isNumber(i))
    decrement.forEach(i => assert.isNumber(i))

    assert.isNumber(await DB.buildWhere('id', 1).increment('price'))
    assert.isNumber(await DB.buildWhere('id', 1).decrement('price'))
  })

  test('should be able to count database values and table column', async ({ assert }) => {
    const DB = Database.buildTable('products')

    const count = await DB.count()
    assert.deepEqual(count, 5)

    const countColumn = await DB.count('price')
    assert.isNumber(countColumn)

    const countDistinct = await DB.countDistinct()
    assert.deepEqual(countDistinct, 5)

    const countDistinctColumn = await DB.countDistinct('price')
    assert.isNumber(countDistinctColumn)
  })

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

  test('should throw an exception when trying to execute the wrong method for input', async ({ assert }) => {
    await assert.rejects(() => Database.create([]), WrongMethodException)
    await assert.rejects(() => Database.createMany({}), WrongMethodException)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await Database.buildTable('users').buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)

    const users = await Database.buildTable('users')
      .buildWhereIn('id', [1, 2])
      .buildOrderBy('id', 'DESC')
      .buildSkip(0)
      .buildLimit(10)
      .findMany()

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[1].id, 1)
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await Database.buildSelect('*')
      .buildTable('users')
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

  test('should throw an empty where exception on delete/update', async ({ assert }) => {
    await assert.rejects(() => Database.delete(), EmptyWhereException)
    await assert.rejects(() => Database.update({}), EmptyWhereException)
  })

  test('should be able to delete user and users', async ({ assert }) => {
    await Database.buildTable('users').buildWhere('id', 3).delete()

    const notFoundUser = await Database.buildTable('users').buildWhere('id', 3).find()

    assert.isNull(notFoundUser)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const rollbackTrx = await Database.buildTable('users').startTransaction()

    await rollbackTrx.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await rollbackTrx.buildWhereIn('id', [1, 2]).findMany())
    await rollbackTrx.rollbackTransaction()
    assert.isNotEmpty(await Database.buildTable('users').buildWhereIn('id', [1, 2]).findMany())

    const commitTrx = await Database.buildTable('users').startTransaction()

    await commitTrx.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await commitTrx.buildWhereIn('id', [1, 2]).findMany())
    await commitTrx.commitTransaction()
    assert.isEmpty(await Database.buildTable('users').buildWhereIn('id', [1, 2]).findMany())
  })

  test('should be able to change connection to mysql', async ({ assert }) => {
    const mysqlDb = await Database.connection('mysql').connect()

    await mysqlDb.runMigrations()

    const user = await mysqlDb.buildTable('users').create({ name: 'João Lenon', email: 'lenonSec7@gmail.com' })

    assert.deepEqual(user.id, 1)

    await mysqlDb.revertMigrations()
    await mysqlDb.close()
  })
})