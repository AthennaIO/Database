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
import { DataSource } from 'typeorm'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Database } from '#src/index'
import { UserMySql } from '#tests/Stubs/models/UserMySql'
import { ProductMySql } from '#tests/Stubs/models/ProductMySql'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'

test.group('MySqlDriverTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connection('mysql').connect()
    await Database.connection('mysql').runMigrations()

    const [user] = await UserMySql.factory().count(10).create({ id: null })
    await ProductMySql.factory().count(5).create({ id: null, userId: user.id })
  })

  group.each.teardown(async () => {
    await Database.connection('mysql').revertMigrations()
    await Database.connection('mysql').close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should throw not connected database exception', async ({ assert }) => {
    await Database.connection('mysql').close()

    assert.throws(() => Database.connection('mysql').buildTable('users'), NotConnectedDatabaseException)

    await Database.connection('mysql').connect()
  })

  test('should be able to get the driver client from the connections', async ({ assert }) => {
    const client = Database.connection('mysql').getClient()

    assert.instanceOf(client, DataSource)
  })

  test('should be able to create and list tables/databases', async ({ assert }) => {
    await Database.connection('mysql').createDatabase('testing')
    await Database.connection('mysql').createTable('testing', {
      columns: [{ name: 'id', type: 'int' }],
    })

    // TODO Refactor to use SHOW TABLES
    // const tables = await Database.connection('mysql').getTables()
    //
    // assert.isTrue(tables.includes('users'))
    // assert.isTrue(tables.includes('testing'))

    assert.isDefined(await Database.connection('mysql').getDatabases())
    assert.isTrue(await Database.connection('mysql').hasTable('testing'))
    assert.isTrue(await Database.connection('mysql').hasDatabase('testing'))
    assert.deepEqual(await Database.connection('mysql').getCurrentDatabase(), 'athenna')

    await Database.connection('mysql').dropDatabase('testing')
  })

  test('should be able to take truncate table data', async ({ assert }) => {
    const users = await Database.connection('mysql').buildTable('users').findMany()

    assert.lengthOf(users, 10)

    await Database.connection('mysql').truncate('users')

    assert.lengthOf(await Database.connection('mysql').buildTable('users').findMany(), 0)
  })

  test('should be able to get avg/avgDistinct from int values in table column', async ({ assert }) => {
    const avg = await Database.connection('mysql').buildTable('products').avg('price')
    const avgDistinct = await Database.connection('mysql').buildTable('products').avgDistinct('price')

    assert.isNumber(avg)
    assert.isNumber(avgDistinct)
  })

  test('should be able to get min/max values in table column', async ({ assert }) => {
    const min = await Database.connection('mysql').buildTable('products').min('price')
    const max = await Database.connection('mysql').buildTable('products').max('price')

    assert.isNumber(min)
    assert.isNumber(max)
  })

  test('should be able to sum/sumDistinct from int values in table column', async ({ assert }) => {
    const sum = await Database.connection('mysql').buildTable('products').sum('price')
    const sumDistinct = await Database.connection('mysql').buildTable('products').sumDistinct('price')

    assert.isNumber(sum)
    assert.isNumber(sumDistinct)
  })

  test('should be able to increment/decrement values in table column', async ({ assert }) => {
    const DB = Database.connection('mysql').buildTable('products')

    const increment = await DB.increment('price')
    const decrement = await DB.decrement('price')

    increment.forEach(i => assert.isNumber(i))
    decrement.forEach(i => assert.isNumber(i))

    assert.isNumber(await DB.buildWhere('id', 1).increment('price'))
    assert.isNumber(await DB.buildWhere('id', 1).decrement('price'))
  })

  test('should be able to count database values and table column', async ({ assert }) => {
    const DB = Database.connection('mysql').buildTable('products')

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
    const user = await Database.connection('mysql').buildTable('users').create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await Database.connection('mysql')
      .buildTable('users')
      .createMany([
        { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
        { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
      ])

    assert.lengthOf(users, 2)
  })

  test('should be able to create or update user', async ({ assert }) => {
    const userCreated = await Database.connection('mysql')
      .buildTable('users')
      .buildWhere('name', 'João Lenon')
      .createOrUpdate({
        name: 'João Lenon',
        email: 'lenonSec7@gmail.com',
      })

    assert.isDefined(userCreated.createdAt)
    assert.isDefined(userCreated.updatedAt)
    assert.isNull(userCreated.deletedAt)

    const userUpdated = await Database.connection('mysql')
      .buildTable('users')
      .buildWhere('name', 'João Lenon')
      .createOrUpdate({ name: 'Victor Tesoura' })

    assert.deepEqual(userCreated.id, userUpdated.id)
    assert.deepEqual(userCreated.name, 'João Lenon')
    assert.deepEqual(userUpdated.name, 'Victor Tesoura')
  })

  test('should throw an exception when trying to execute the wrong method for input', async ({ assert }) => {
    await assert.rejects(() => Database.connection('mysql').buildTable('users').create([]), WrongMethodException)
    await assert.rejects(() => Database.connection('mysql').buildTable('users').createMany({}), WrongMethodException)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await Database.connection('mysql').buildTable('users').buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)

    const users = await Database.connection('mysql')
      .buildTable('users')
      .buildWhereIn('id', [1, 2])
      .buildOrderBy('id', 'DESC')
      .buildSkip(0)
      .buildLimit(10)
      .findMany()

    assert.lengthOf(users, 2)
  })

  test('should be able to find users as a Collection', async ({ assert }) => {
    const collection = await Database.connection('mysql')
      .buildTable('users')
      .buildWhereIn('id', [1, 2])
      .buildOrderBy('id', 'DESC')
      .buildSkip(0)
      .buildLimit(10)
      .collection()

    const users = collection.all()

    assert.lengthOf(users, 2)
  })

  test('should be able to transform array to a Collection', async ({ assert }) => {
    const collection = await (
      await Database.connection('mysql')
        .buildTable('users')
        .buildWhereIn('id', [1, 2])
        .buildOrderBy('id', 'DESC')
        .buildSkip(0)
        .buildLimit(10)
        .findMany()
    ).toCollection()

    const users = collection.all()

    assert.lengthOf(users, 2)
  })

  test('should be able to find user and fail', async ({ assert }) => {
    await assert.rejects(
      () => Database.connection('mysql').buildTable('users').buildWhere('id', 12349).findOrFail(),
      NotFoundDataException,
    )

    const user = await Database.connection('mysql').buildTable('users').buildWhere('id', 1).findOrFail()

    assert.deepEqual(user.id, 1)
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await Database.connection('mysql')
      .buildTable('users')
      .buildSelect('*')
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
    const user = await Database.connection('mysql')
      .buildTable('users')
      .buildWhere('id', 1)
      .update({ name: 'João Lenon Updated' })

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const users = await Database.connection('mysql')
      .buildTable('users')
      .buildWhereIn('id', [1, 2])
      .update({ name: 'João Lenon Updated' })

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 1)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, 2)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should throw an empty where exception on delete/update', async ({ assert }) => {
    await assert.rejects(() => Database.connection('mysql').buildTable('users').delete(), EmptyWhereException)
    await assert.rejects(() => Database.connection('mysql').buildTable('users').update({}), EmptyWhereException)
  })

  test('should be able to delete user and users', async ({ assert }) => {
    await Database.connection('mysql').buildTable('users').buildWhere('id', 3).delete()

    const notFoundUser = await Database.connection('mysql').buildTable('users').buildWhere('id', 3).find()

    assert.isNull(notFoundUser)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const rollbackTrx = await Database.connection('mysql').startTransaction()
    const rollbackTrxQuery = rollbackTrx.buildTable('users')

    await rollbackTrxQuery.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await rollbackTrxQuery.buildWhereIn('id', [1, 2]).findMany())

    await rollbackTrx.rollbackTransaction()

    assert.isNotEmpty(await Database.connection('mysql').buildTable('users').buildWhereIn('id', [1, 2]).findMany())

    const commitTrx = await Database.connection('mysql').startTransaction()
    const commitTrxQuery = commitTrx.buildTable('users')

    await commitTrxQuery.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await commitTrxQuery.buildWhereIn('id', [1, 2]).findMany())

    await commitTrx.commitTransaction()

    assert.isEmpty(await Database.connection('mysql').buildTable('users').buildWhereIn('id', [1, 2]).findMany())
  })

  test('should be able to change connection to postgresql', async ({ assert }) => {
    const postgresDb = await Database.connection('postgres').connect()

    await postgresDb.runMigrations()

    const user = await postgresDb.buildTable('users').create({ name: 'João Lenon', email: 'lenonSec7@gmail.com' })

    assert.deepEqual(user.id, 1)

    await postgresDb.revertMigrations()
    await postgresDb.close()
  })

  test('should be able to create connection without saving on driver', async ({ assert }) => {
    const DB = await Database.connection('mysql').connect(true, false)

    const user = await DB.buildTable('users').buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)

    await DB.close()
  })
})
