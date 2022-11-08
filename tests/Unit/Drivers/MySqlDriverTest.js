/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Folder, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Database } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'

test.group('MySqlDriverTest', group => {
  /** @type {MySqlDatabaseImpl} */
  let DB = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    DB = await Database.connection('mysql').connect()

    await DB.runMigrations()

    const { id } = await DB.table('users').create({
      name: 'João Lenon',
      email: 'lenon@athenna.io',
    })

    await DB.table('products').createMany([
      { userId: id, name: 'iPhone 13', price: 1000 },
      { userId: id, name: 'iPhone 14', price: 2000 },
    ])

    await DB.table('users').create({
      name: 'Victor Tesoura',
      email: 'txsoura@athenna.io',
      createdAt: new Date(Date.now() + 100000),
      updatedAt: new Date(Date.now() + 100000),
    })
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

    assert.throws(() => DB.table('users'), NotConnectedDatabaseException)

    await DB.connect()
  })

  test('should be able to get the driver client and query builder from the connections', async ({ assert }) => {
    const dbClient = DB.getClient()
    const queryBuilderClient = DB.table('users').getClient()

    const dbQueryBuilder = DB.getQueryBuilder()
    const queryBuilderQueryBuilder = DB.table('users').getQueryBuilder()

    assert.isDefined(dbClient)
    assert.isDefined(queryBuilderClient)
    assert.isDefined(dbQueryBuilder)
    assert.isDefined(queryBuilderQueryBuilder)
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
    assert.isTrue(databases.includes('mysql'))
    assert.isTrue(databases.includes('athenna'))
    assert.isTrue(databases.includes('information_schema'))

    assert.isTrue(await DB.hasTable('testing'))
    assert.isTrue(await DB.hasDatabase('testing'))
    assert.deepEqual(await DB.getCurrentDatabase(), 'athenna')
  })

  test('should be able to get avg/avgDistinct from int values in table column', async ({ assert }) => {
    const avg = await DB.table('products').avg('price')
    const avgDistinct = await DB.table('products').avgDistinct('price')

    assert.isDefined(avg)
    assert.isDefined(avgDistinct)
  })

  test('should be able to get min/max values in table column', async ({ assert }) => {
    const min = await DB.table('products').min('price')
    const max = await DB.table('products').max('price')

    assert.isDefined(min)
    assert.isDefined(max)
  })

  test('should be able to sum/sumDistinct from int values in table column', async ({ assert }) => {
    const sum = await DB.table('products').sum('price')
    const sumDistinct = await DB.table('products').sumDistinct('price')

    assert.isDefined(sum)
    assert.isDefined(sumDistinct)
  })

  test('should be able to increment values in table column', async ({ assert }) => {
    const product = await DB.table('products').find()

    await DB.table('products').increment('price')

    const productUpdated = await DB.table('products').find()

    assert.deepEqual(product.price + 1, productUpdated.price)
  })

  test('should be able to decrement values in table column', async ({ assert }) => {
    const product = await DB.table('products').find()

    await DB.table('products').decrement('price')

    const productUpdated = await DB.table('products').find()

    assert.deepEqual(product.price - 1, productUpdated.price)
  })

  test('should be able to count database values and table column', async ({ assert }) => {
    assert.deepEqual(await DB.table('products').count(), '2')
    assert.deepEqual(await DB.table('products').count('price'), '2')
    assert.deepEqual(await DB.table('products').countDistinct('price'), '2')
  })

  test('should be able to truncate table data', async ({ assert }) => {
    assert.lengthOf(await DB.table('products').findMany(), 2)

    await DB.truncate('products')

    assert.lengthOf(await DB.table('products').findMany(), 0)
  })

  test('should be able to create user and users', async ({ assert }) => {
    const user = await DB.table('users').create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await DB.table('users').createMany([
      { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
  })

  test('should be able to create or update user', async ({ assert }) => {
    const userCreated = await DB.table('users').where('name', 'João Lenon').createOrUpdate({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(userCreated.createdAt)
    assert.isDefined(userCreated.updatedAt)
    assert.isNull(userCreated.deletedAt)

    const userUpdated = await DB.table('users').where('name', 'João Lenon').createOrUpdate({ name: 'Victor Tesoura' })

    assert.deepEqual(userCreated.id, userUpdated.id)
    assert.deepEqual(userCreated.name, 'João Lenon')
    assert.deepEqual(userUpdated.name, 'Victor Tesoura')
  })

  test('should throw an exception when trying to execute the wrong method for input', async ({ assert }) => {
    await assert.rejects(() => DB.table('users').create([]), WrongMethodException)
    await assert.rejects(() => DB.table('users').createMany({}), WrongMethodException)
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await DB.table('users')
      .select('users.id as users_id')
      .select('products.id as products_id')
      .where('users.id', 1)
      .orWhere('users.id', 2)
      .whereExists(Database.table('products').where('id', 1).orWhere('id', 2))
      .orWhereExists(Database.table('products').where('id', 2).orWhere('id', 3))
      .join('products', 'users.id', 'products.userId')
      .find()

    assert.deepEqual(user.users_id, 1)
    assert.deepEqual(user.products_id, 1)

    const users = await DB.table('users')
      .select('users.id as users_id')
      .select('products.id as products_id')
      .whereIn('users.id', [1])
      .orWhere('users.id', 2)
      .orderBy('users.id', 'DESC')
      .offset(0)
      .limit(10)
      .whereNotExists(Database.table('products').where('id', 1).orWhere('id', 2))
      .orWhereNotExists(Database.table('products').where('id', 3).orWhere('id', 4))
      .join('products', 'users.id', 'products.userId')
      .findMany()

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].users_id, users[1].users_id)
    assert.deepEqual(users[0].products_id, 1)
    assert.deepEqual(users[1].products_id, 2)
  })

  test('should be able to find user and users grouped', async ({ assert }) => {
    const users = await DB.table('users')
      .select('id', 'name', 'deletedAt')
      .groupBy('id', 'name')
      .havingBetween('id', [0, 3])
      .havingNotBetween('id', [9, 99])
      .orHavingBetween('id', [4, 7])
      .havingNull('deletedAt')
      .findMany()

    assert.lengthOf(users, 2)
  })

  test('should be able to find users as a Collection', async ({ assert }) => {
    const collection = await DB.table('users').whereIn('id', [1]).orderBy('id', 'DESC').offset(0).limit(10).collection()

    const users = collection.all()

    assert.lengthOf(users, 1)
  })

  test('should be able to transform array to a Collection', async ({ assert }) => {
    const collection = await (
      await DB.table('users').whereIn('id', [1]).orderBy('id', 'DESC').offset(0).limit(10).findMany()
    ).toCollection()

    const users = collection.all()

    assert.lengthOf(users, 1)
  })

  test('should be able to find user and fail', async ({ assert }) => {
    await assert.rejects(() => DB.table('users').where('id', 12349).findOrFail(), NotFoundDataException)

    const user = await DB.table('users').where('id', 1).findOrFail()

    assert.deepEqual(user.id, 1)
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await DB.table('users')
      .select('*')
      .whereIn('id', [1])
      .orderBy('id', 'DESC')
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
    const user = await DB.table('users').where('id', 1).update({ name: 'João Lenon Updated' })

    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const users = await DB.table('users').whereIn('id', [1, 2]).update({ name: 'João Lenon Updated' })

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 1)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, 2)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should be able to delete user and users', async ({ assert }) => {
    await DB.table('users').where('id', 3).delete()

    const notFoundUser = await DB.table('users').where('id', 3).find()

    assert.isUndefined(notFoundUser)
  })

  test('should be able to start/commit/rollback transactions', async ({ assert }) => {
    const rollbackTrx = await DB.startTransaction()
    const rollbackTrxQuery = rollbackTrx.table('products')

    await rollbackTrxQuery.whereIn('id', [1, 2]).delete()
    assert.isEmpty(await rollbackTrxQuery.whereIn('id', [1, 2]).findMany())

    await rollbackTrx.rollbackTransaction()

    assert.isNotEmpty(await DB.table('products').whereIn('id', [1, 2]).findMany())

    const commitTrx = await DB.startTransaction()
    const commitTrxQuery = commitTrx.table('products')

    await commitTrxQuery.whereIn('id', [1, 2]).delete()
    assert.isEmpty(await commitTrxQuery.whereIn('id', [1, 2]).findMany())

    await commitTrx.commitTransaction()

    assert.isEmpty(await DB.table('products').whereIn('id', [1, 2]).findMany())
  })

  test('should be able to change connection to postgresql', async ({ assert }) => {
    const postgresDb = await Database.connection('postgres').connect()

    await postgresDb.runMigrations()

    const user = await postgresDb.table('users').create({ name: 'João Lenon', email: 'lenonSec7@gmail.com' })

    assert.deepEqual(user.id, 1)

    await postgresDb.revertMigrations()
    await postgresDb.close()
  })

  test('should be able to create connection without saving on driver', async ({ assert }) => {
    const otherDB = await Database.connection('mysql').connect(true, false)

    const user = await otherDB.table('users').where('id', 1).find()

    assert.deepEqual(user.id, 1)

    await otherDB.close()
  })

  test('should be able to find users ordering by latest and oldest', async ({ assert }) => {
    const oldestCreatedAt = await DB.table('users').oldest().find()
    const latestCreatedAt = await DB.table('users').latest().find()

    assert.isTrue(oldestCreatedAt.createdAt < latestCreatedAt.createdAt)
  })

  test('should be able to find users ordering by latest and oldest with different columns', async ({ assert }) => {
    const oldestUpdatedAt = await DB.table('users').oldest('updatedAt').find()
    const latestUpdatedAt = await DB.table('users').latest('updatedAt').find()

    assert.isTrue(oldestUpdatedAt.updatedAt < latestUpdatedAt.updatedAt)
  })

  test('should be able to find users if value is true', async ({ assert }) => {
    const trueValue = true

    const found = await DB.table('users')
      .where('id', 0)
      .when(trueValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isDefined(found)

    const falseValue = false

    const notFound = await DB.table('users')
      .where('id', 0)
      .when(falseValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isUndefined(notFound)
  })

  test('should be able to get users using OR queries', async ({ assert }) => {
    const whereUsers = await DB.table('users')
      .whereNot('id', 0)
      .where('id', 1)
      .orWhere('id', 2)
      .orWhereNot('id', 9)
      .orWhereIn('id', [1, 2, 3])
      .orWhereNotIn('id', [4, 5, 6])
      .orWhereNull('deletedAt')
      .orWhereNotNull('name')
      .orWhereBetween('id', [1, 10])
      .orWhereNotBetween('id', [11, 20])
      .orWhereLike('name', '%testing%')
      .orWhereILike('name', '%testing%')
      .orWhereExists(Database.table('users').where('id', 1))
      .orWhereNotExists(Database.table('users').where('id', 2))
      .findMany()

    assert.lengthOf(whereUsers, 2)
  })

  test('should be able to get users using GROUP BY and HAVING queries', async ({ assert }) => {
    const groupByUsers = await DB.table('users')
      .groupBy('id', 'name')
      .having('id', 1)
      .havingIn('id', [1, 2, 3])
      .havingNotIn('id', [4, 5, 6])
      .havingNull('deletedAt')
      .havingNotNull('name')
      .havingBetween('id', [1, 10])
      .havingNotBetween('id', [11, 20])
      .orHaving('id', 2)
      .orHavingIn('id', [1, 2, 3])
      .orHavingNotIn('id', [4, 5, 6])
      .orHavingNull('deletedAt')
      .orHavingNotNull('name')
      .orHavingBetween('id', [1, 10])
      .orHavingNotBetween('id', [11, 20])
      .orHavingExists(Database.table('users').where('id', 1))
      .orHavingNotExists(Database.table('users').where('id', 2))
      .findMany()

    assert.lengthOf(groupByUsers, 2)
  })

  test('should be able to execute raw methods of query builder', async ({ assert }) => {
    const usersJoinProducts = await DB.table('users')
      .joinRaw('inner join products')
      .whereRaw('`users`.`deletedAt` is null')
      .orWhereRaw("`users`.`name` = 'João Lenon'")
      .orderByRaw('`users`.`id` DESC')
      .groupByRaw('`users`.`id`, `products`.`id`')
      .havingRaw('`products`.`deletedAt` is null')
      .orHavingRaw("`products`.`name` = 'iPhone 14'")
      .findMany()

    assert.lengthOf(usersJoinProducts, 4)
  })

  test('should be able to use select raw to count data', async ({ assert }) => {
    const report = await DB.table('users')
      .selectRaw('count(id) as number_of_users, deletedAt')
      .groupBy('deletedAt')
      .havingBetween('number_of_users', [0, 10])
      .findMany()

    assert.deepEqual(report[0].deletedAt, null)
    assert.deepEqual(report[0].number_of_users, 2)
  })

  test('should be able to use select raw to count data', async ({ assert }) => {
    const report = await DB.table('users')
      .selectRaw('count(id) as number_of_users, deletedAt')
      .groupBy('deletedAt')
      .havingBetween('number_of_users', [0, 10])
      .findMany()

    assert.deepEqual(report[0].deletedAt, null)
    assert.deepEqual(report[0].number_of_users, 2)
  })

  test('should be able to execute different join types', async ({ assert }) => {
    const leftJoin = await DB.table('users').leftJoin('products', 'users.id', 'products.userId').findMany()
    assert.lengthOf(leftJoin, 3)

    const rightJoin = await DB.table('users').rightJoin('products', 'users.id', 'products.userId').findMany()
    assert.lengthOf(rightJoin, 2)

    const crossJoin = await DB.table('users').crossJoin('products').findMany()
    assert.lengthOf(crossJoin, 4)

    const leftOuterJoin = await DB.table('users')
      .leftOuterJoin('products', join => join.on('users.id', 'products.userId'))
      .findMany()
    assert.lengthOf(leftOuterJoin, 3)

    const rightOuterJoin = await DB.table('users')
      .rightOuterJoin('products', join => join.on('users.id', 'products.userId'))
      .findMany()
    assert.lengthOf(rightOuterJoin, 2)
  })

  test('should be able to execute some where clauses using closures', async ({ assert }) => {
    const users = await DB.table('users')
      .where(query => {
        query.where('id', 1).orWhereNull('deletedAt')
      })
      .orWhere(query => {
        query.where('id', 1).orWhereNull('deletedAt')
      })
      .oldest()
      .findMany()

    assert.lengthOf(users, 2)
  })

  test('should be able to execute some having clauses using closures', async ({ assert }) => {
    const users = await DB.table('users')
      .groupBy('id', 'name')
      .having(query => {
        query.where('id', 1).orWhereNull('deletedAt')
      })
      .orHaving(query => {
        query.where('id', 1).orWhereNull('deletedAt')
      })
      .oldest()
      .findMany()

    assert.lengthOf(users, 2)
  })
})
