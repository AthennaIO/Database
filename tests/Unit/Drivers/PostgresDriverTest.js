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

import { Database } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'

test.group('PostgresDriverTest', group => {
  /** @type {DatabaseImpl} */
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

    DB = await Database.connect()

    await DB.runMigrations()

    const [{ id }] = await DB.buildTable('users').createMany([
      { name: 'João Lenon', email: 'lenon@athenna.io' },
      { name: 'Victor Tesoura', email: 'txsoura@athenna.io' },
    ])
    await DB.buildTable('products').createMany([
      { userId: id, name: 'iPhone 13', price: 1000 },
      { userId: id, name: 'iPhone 14', price: 2000 },
    ])
  })

  group.each.teardown(async () => {
    await DB.dropTable('testing')
    await DB.dropDatabase('testing')
    await DB.revertMigrations()
    await DB.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should throw not connected database exception', async ({ assert }) => {
    await DB.close()

    assert.throws(() => DB.buildTable('users'), NotConnectedDatabaseException)

    await DB.connect()
  })

  test('should be able to get the driver client from the connections', async ({ assert }) => {
    const client = DB.getClient()

    assert.isDefined(client)
  })

  test('should be able to create and list tables/databases', async ({ assert }) => {
    await DB.createDatabase('testing')
    await DB.createTable('testing', table => {
      table.integer('id')
    })

    const tables = await DB.getTables()
    const databases = await DB.getDatabases()

    assert.isTrue(tables.includes('users'))
    assert.isTrue(tables.includes('testing'))
    assert.isTrue(databases.includes('postgres'))

    assert.isTrue(await DB.hasTable('testing'))
    assert.isTrue(await DB.hasDatabase('testing'))
    assert.deepEqual(await DB.getCurrentDatabase(), 'postgres')
  })

  test('should be able to get avg/avgDistinct from int values in table column', async ({ assert }) => {
    const avg = await DB.buildTable('products').avg('price')
    const avgDistinct = await DB.buildTable('products').avgDistinct('price')

    assert.isDefined(avg)
    assert.isDefined(avgDistinct)
  })

  test('should be able to get min/max values in table column', async ({ assert }) => {
    const min = await DB.buildTable('products').min('price')
    const max = await DB.buildTable('products').max('price')

    assert.isDefined(min)
    assert.isDefined(max)
  })

  test('should be able to sum/sumDistinct from int values in table column', async ({ assert }) => {
    const sum = await DB.buildTable('products').sum('price')
    const sumDistinct = await DB.buildTable('products').sumDistinct('price')

    assert.isDefined(sum)
    assert.isDefined(sumDistinct)
  })

  test('should be able to increment values in table column', async ({ assert }) => {
    const product = await DB.buildTable('products').find()

    await DB.buildTable('products').increment('price')

    const productUpdated = await DB.buildTable('products').find()

    assert.deepEqual(product.price + 1, productUpdated.price)
  })

  test('should be able to decrement values in table column', async ({ assert }) => {
    const product = await DB.buildTable('products').find()

    await DB.buildTable('products').decrement('price')

    const productUpdated = await DB.buildTable('products').find()

    assert.deepEqual(product.price - 1, productUpdated.price)
  })

  test('should be able to count database values and table column', async ({ assert }) => {
    assert.deepEqual(await DB.buildTable('products').count(), '2')
    assert.deepEqual(await DB.buildTable('products').count('price'), '2')
    assert.deepEqual(await DB.buildTable('products').countDistinct('price'), '2')
  })

  test('should be able to truncate table data', async ({ assert }) => {
    assert.lengthOf(await DB.buildTable('products').findMany(), 2)

    await DB.truncate('products')

    assert.lengthOf(await DB.buildTable('products').findMany(), 0)
  })

  test('should be able to create user and users', async ({ assert }) => {
    const user = await DB.buildTable('users').create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await DB.buildTable('users').createMany([
      { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
  })

  test('should be able to create or update user', async ({ assert }) => {
    const userCreated = await DB.buildTable('users').buildWhere('name', 'João Lenon').createOrUpdate({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(userCreated.createdAt)
    assert.isDefined(userCreated.updatedAt)
    assert.isNull(userCreated.deletedAt)

    const userUpdated = await DB.buildTable('users')
      .buildWhere('name', 'João Lenon')
      .createOrUpdate({ name: 'Victor Tesoura' })

    assert.deepEqual(userCreated.id, userUpdated.id)
    assert.deepEqual(userCreated.name, 'João Lenon')
    assert.deepEqual(userUpdated.name, 'Victor Tesoura')
  })

  test('should throw an exception when trying to execute the wrong method for input', async ({ assert }) => {
    await assert.rejects(() => DB.buildTable('users').create([]), WrongMethodException)
    await assert.rejects(() => DB.buildTable('users').createMany({}), WrongMethodException)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await DB.buildTable('users')
      .buildSelect('users.id as users_id')
      .buildSelect('products.id as products_id')
      .buildWhere('users.id', 1)
      .buildOrWhere('users.id', 2)
      .buildJoin('products', 'users.id', 'products.userId')
      .find()

    assert.deepEqual(user.users_id, 1)
    assert.deepEqual(user.products_id, 1)

    const users = await DB.buildTable('users')
      .buildSelect('users.id as users_id')
      .buildSelect('products.id as products_id')
      .buildWhereIn('users.id', [1])
      .buildOrWhere('users.id', 2)
      .buildOrderBy('users.id', 'DESC')
      .buildOffset(0)
      .buildLimit(10)
      .buildJoin('products', 'users.id', 'products.userId')
      .findMany()

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].users_id, users[1].users_id)
    assert.deepEqual(users[0].products_id, 1)
    assert.deepEqual(users[1].products_id, 2)
  })

  test('should be able to find users as a Collection', async ({ assert }) => {
    const collection = await DB.buildTable('users')
      .buildWhereIn('id', [1])
      .buildOrderBy('id', 'DESC')
      .buildOffset(0)
      .buildLimit(10)
      .collection()

    const users = collection.all()

    assert.lengthOf(users, 1)
  })

  test('should be able to transform array to a Collection', async ({ assert }) => {
    const collection = await (
      await DB.buildTable('users')
        .buildWhereIn('id', [1])
        .buildOrderBy('id', 'DESC')
        .buildOffset(0)
        .buildLimit(10)
        .findMany()
    ).toCollection()

    const users = collection.all()

    assert.lengthOf(users, 1)
  })

  test('should be able to find user and fail', async ({ assert }) => {
    await assert.rejects(() => DB.buildTable('users').buildWhere('id', 12349).findOrFail(), NotFoundDataException)

    const user = await DB.buildTable('users').buildWhere('id', 1).findOrFail()

    assert.deepEqual(user.id, 1)
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await DB.buildTable('users')
      .buildSelect('*')
      .buildWhereIn('id', [1])
      .buildOrderBy('id', 'DESC')
      .paginate()

    assert.lengthOf(data, 1)
    assert.deepEqual(meta.itemCount, 1)
    assert.deepEqual(meta.totalItems, 1)
    assert.deepEqual(meta.totalPages, 1)
    assert.deepEqual(meta.currentPage, 0)
    assert.deepEqual(meta.itemsPerPage, 10)

    assert.deepEqual(links.first, '/?limit=10')
    assert.deepEqual(links.previous, '/?page=0&limit=10')
    assert.deepEqual(links.next, '/?page=1&limit=10')
    assert.deepEqual(links.last, '/?page=1&limit=10')
  })

  test('should be able to update user and users', async ({ assert }) => {
    const user = await DB.buildTable('users').buildWhere('id', 1).update({ name: 'João Lenon Updated' })

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const users = await DB.buildTable('users').buildWhereIn('id', [1, 2]).update({ name: 'João Lenon Updated' })

    assert.lengthOf(users, 2)
    assert.deepEqual(users[1].id, 1)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
  })

  test('should be able to delete user and users', async ({ assert }) => {
    await DB.buildTable('users').buildWhere('id', 3).delete()

    const notFoundUser = await DB.buildTable('users').buildWhere('id', 3).find()

    assert.isUndefined(notFoundUser)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const rollbackTrx = await DB.startTransaction()
    const rollbackTrxQuery = rollbackTrx.buildTable('products')

    await rollbackTrxQuery.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await rollbackTrxQuery.buildWhereIn('id', [1, 2]).findMany())

    await rollbackTrx.rollbackTransaction()

    assert.isNotEmpty(await DB.buildTable('products').buildWhereIn('id', [1, 2]).findMany())

    const commitTrx = await DB.startTransaction()
    const commitTrxQuery = commitTrx.buildTable('products')

    await commitTrxQuery.buildWhereIn('id', [1, 2]).delete()
    assert.isEmpty(await commitTrxQuery.buildWhereIn('id', [1, 2]).findMany())

    await commitTrx.commitTransaction()

    assert.isEmpty(await DB.buildTable('products').buildWhereIn('id', [1, 2]).findMany())
  })

  test('should be able to change connection to mysql', async ({ assert }) => {
    const postgresDb = await Database.connection('mysql').connect()

    await postgresDb.runMigrations()

    const user = await postgresDb.buildTable('users').create({ name: 'João Lenon', email: 'lenonSec7@gmail.com' })

    assert.deepEqual(user.id, 1)

    await postgresDb.revertMigrations()
    await postgresDb.close()
  })

  test('should be able to create connection without saving on driver', async ({ assert }) => {
    const otherDB = await Database.connection('postgres').connect(true, false)

    const user = await otherDB.buildTable('users').buildWhere('id', 1).find()

    assert.deepEqual(user.id, 1)

    await otherDB.close()
  })
})
