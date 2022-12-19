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

import { Criteria, Database } from '#src/index'
import { MongoMemory } from '#tests/Helpers/MongoMemory'
import { UserMongo } from '#tests/Stubs/models/UserMongo'
import { ProductMongo } from '#tests/Stubs/models/ProductMongo'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { UserResource } from '#tests/Stubs/app/Resources/UserResource'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { ProductDetailMongo } from '#tests/Stubs/models/ProductDetailMongo'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

test.group('UserMongoModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))

    await MongoMemory.start()
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connection('mongo').connect()

    await UserMongo.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await ProductDetailMongo.truncate()
    await ProductMongo.truncate()
    await UserMongo.truncate()
    await Database.closeAll()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())

    await MongoMemory.stop()
  })

  test('should be able to create user and users', async ({ assert }) => {
    const user = await UserMongo.create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await UserMongo.createMany([
      { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].name, 'Victor Tesoura')
    assert.isUndefined(users[0].email)
    assert.deepEqual(users[1].name, 'Henry Bernardo')
    assert.isUndefined(users[1].email)
  })

  test('should be able to create or update user', async ({ assert }) => {
    const userCreated = await UserMongo.createOrUpdate(
      { name: 'João Lenon' },
      {
        name: 'João Lenon',
        email: 'lenonSec7@gmail.com',
      },
    )

    assert.isDefined(userCreated.createdAt)
    assert.isDefined(userCreated.updatedAt)
    assert.isNull(userCreated.deletedAt)

    const userUpdated = await UserMongo.createOrUpdate(
      { name: 'João Lenon' },
      {
        name: 'Victor Tesoura',
      },
    )

    assert.deepEqual(userCreated.id, userUpdated.id)
    assert.deepEqual(userCreated.name, 'João Lenon')
    assert.deepEqual(userUpdated.name, 'Victor Tesoura')
  })

  test('should be able to find user and users', async ({ assert }) => {
    const user = await UserMongo.find()

    assert.isUndefined(user.email)

    const users = await UserMongo.query().select('*').whereIn('id', [user.id]).orderBy('id', 'DESC').findMany()

    assert.lengthOf(users, 1)
    assert.isDefined(users[0].email)
    assert.deepEqual(users[0].id, user.id)

    const allUsers = await UserMongo.findMany()

    assert.lengthOf(allUsers, 10)
  })

  test('should be able to find user and users grouped', async ({ assert }) => {
    const users = await UserMongo.query()
      .select('id', 'name', 'deletedAt')
      .groupBy('id', 'name')
      .havingBetween('id', [0, 5000000])
      .havingNotBetween('id', [5000001, 9999999])
      .orHavingBetween('id', [4, 7])
      .havingNull('deletedAt')
      .findMany()

    assert.lengthOf(users, 10)
  })

  test('should be able to get users as a collection', async ({ assert }) => {
    const collection = await UserMongo.query().orderBy('id', 'DESC').collection()

    const users = collection.all()

    assert.lengthOf(users, 10)
    assert.isDefined(users[0].name)
    assert.isDefined(users[1].name)

    const otherCollection = await UserMongo.collection()
    const allUsers = otherCollection.all()

    assert.lengthOf(allUsers, 10)
  })

  test('should be able to find user and fail', async ({ assert }) => {
    const user = await UserMongo.findOrFail()

    assert.isDefined(user.id)
    assert.isUndefined(user.email)

    await assert.rejects(() => UserMongo.findOrFail({ id: 123459 }), NotFoundDataException)
  })

  test('should be able to find user using query builder', async ({ assert }) => {
    await UserMongo.truncate()

    const createdAt = new Date(Date.now() - 100000)

    await UserMongo.factory().create({ name: 'João', createdAt })
    await UserMongo.factory().create({ name: 'joão lenon', createdAt })
    await UserMongo.factory().create({ name: 'Victor', createdAt })
    await UserMongo.factory().create({ name: 'victor tesoura' })

    assert.lengthOf(await UserMongo.query().whereLike('name', 'João%').findMany(), 1)
    assert.lengthOf(await UserMongo.query().whereILike('name', 'João%').findMany(), 2)
    assert.lengthOf(await UserMongo.query().whereNot('name', 'João').findMany(), 3)
    assert.lengthOf(await UserMongo.query().whereNotIn('name', ['João', 'Victor']).findMany(), 2)

    await UserMongo.query().whereILike('name', 'joão%').update({ deletedAt: new Date() }, true)

    assert.lengthOf(await UserMongo.query().removeCriteria('deletedAt').whereNotNull('deletedAt').findMany(), 2)

    assert.lengthOf(
      await UserMongo.query().removeCriteria('deletedAt').whereBetween('createdAt', [createdAt, new Date()]).findMany(),
      3,
    )

    assert.lengthOf(
      await UserMongo.query()
        .removeCriteria('deletedAt')
        .whereNotBetween('createdAt', [createdAt, new Date()])
        .findMany(),
      1,
    )
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await UserMongo.paginate()

    assert.lengthOf(data, 10)
    assert.deepEqual(meta.itemCount, 10)
    assert.deepEqual(meta.totalItems, 10)
    assert.deepEqual(meta.totalPages, 1)
    assert.deepEqual(meta.currentPage, 0)
    assert.deepEqual(meta.itemsPerPage, 10)

    assert.deepEqual(links.first, '/?limit=10')
    assert.deepEqual(links.previous, '/?page=0&limit=10')
    assert.deepEqual(links.next, '/?page=1&limit=10')
    assert.deepEqual(links.last, '/?page=1&limit=10')
  })

  test('should be able to update user and users', async ({ assert }) => {
    const { id, createdAt } = await UserMongo.create({ name: 'João Lenon' })

    const user = await UserMongo.update({ id }, { name: 'João Lenon Updated', createdAt: new Date() })

    assert.deepEqual(user.createdAt, createdAt)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const usersDates = await UserMongo.query().findMany()
    const users = await UserMongo.query()
      .whereIn('id', [usersDates[0].id, usersDates[1].id])
      .update({ name: 'João Lenon Updated', createdAt: new Date() })

    assert.deepEqual(users[0].createdAt, usersDates[0].createdAt)
    assert.deepEqual(users[1].createdAt, usersDates[1].createdAt)
    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, usersDates[0].id)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, usersDates[1].id)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should be able to save user', async ({ assert }) => {
    const user = await UserMongo.create({ name: 'João Lenon' })

    const createdAt = new Date()

    user.name = 'João Lenon Updated'
    user.createdAt = createdAt

    await user.save()

    assert.deepEqual(user.name, 'João Lenon Updated')
    assert.notEqual(user.createdAt, createdAt)
    assert.lengthOf(await UserMongo.findMany({ name: 'João Lenon Updated' }), 1)

    const users = await UserMongo.findMany()

    users[0].name = 'João Lenon Array Updated'
    users[0].createdAt = createdAt

    await users[0].save()

    assert.deepEqual(users[0].name, 'João Lenon Array Updated')
    assert.notEqual(users[0].createdAt, createdAt)
    assert.lengthOf(await UserMongo.findMany({ name: 'João Lenon Array Updated' }), 1)
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => UserMongo.update({}), EmptyWhereException)
  })

  test('should be able to delete/softDelete user and users', async ({ assert }) => {
    await UserMongo.delete({ id: 3 }, true)

    const notFoundUser = await UserMongo.find({ id: 3 })

    assert.isUndefined(notFoundUser)

    const { id } = await UserMongo.find()
    await UserMongo.query().where({ id }).delete()

    const users = await UserMongo.query().removeCriteria('deletedAt').where('id', id).findMany()

    assert.lengthOf(users, 1)

    assert.deepEqual(users[0].id, id)
    assert.isDefined(users[0].deletedAt)
  })

  test('should throw a empty where exception on delete without where', async ({ assert }) => {
    await assert.rejects(() => UserMongo.delete({}), EmptyWhereException)
  })

  test('should be able to add products to user', async ({ assert }) => {
    const userId = await UserMongo.factory('id').create()
    const { id } = await ProductMongo.create({ name: 'iPhone X', userId })

    const user = await UserMongo.query().where({ id: userId }).with('products').find()

    assert.deepEqual(user.products[0].id, id)
    assert.deepEqual(user.products[0].name, 'iPhone X')
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const userId = await UserMongo.factory('id').create()
    await ProductMongo.factory().count(5).create({ userId })
    await ProductMongo.factory().count(5).create({ userId, deletedAt: new Date() })

    const user = await UserMongo.query()
      .select('id', 'name')
      .where('id', userId)
      .with('products', query => query.select('id', 'name').whereNull('deletedAt').orderBy('id', 'DESC'))
      .find()

    assert.deepEqual(user.id, userId)
    assert.lengthOf(user.products, 5)

    user.products[0].name = 'MacOS'

    await user.products[0].save()

    const product = await ProductMongo.find({ name: 'MacOS' })

    assert.deepEqual(user.products[0].id, product.id)
  })

  test('should be able to make database assertions', async () => {
    const userId = await UserMongo.factory('id').create()
    await ProductMongo.factory().count(5).create({ userId })
    await ProductMongo.factory().count(5).create({ userId, deletedAt: new Date() })

    await UserMongo.assertExists({ id: userId })
    await ProductMongo.assertCount(5)
    await ProductMongo.assertSoftDelete({ userId })
  })

  test('should be able to get the user as JSON', async ({ assert }) => {
    const [user] = await UserMongo.query().with('products').findMany()

    const userJson = user.toJSON()

    assert.notInstanceOf(userJson, UserMongo)
  })

  test('should be able to get the user/users as resource using resource class', async ({ assert }) => {
    const users = await UserMongo.query().with('products').findMany()

    const userResource = UserResource.toJson(users[0])

    assert.notInstanceOf(userResource, UserMongo)

    assert.isUndefined(userResource.createdAt)
    assert.isDefined(userResource.products)
    assert.lengthOf(userResource.products, 0)
    assert.isUndefined(UserResource.toArray(users)[0].createdAt)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => UserMongo.query().with('notImplemented'), NotImplementedRelationException)
  })

  test('should be able to find users ordering by latest and oldest', async ({ assert }) => {
    const oldestCreatedAt = await UserMongo.query().oldest().find()
    const latestCreatedAt = await UserMongo.query().latest().find()

    assert.isTrue(oldestCreatedAt.createdAt < latestCreatedAt.createdAt)
  })

  test('should be able to find users ordering by latest and oldest with different columns', async ({ assert }) => {
    const oldestUpdatedAt = await UserMongo.query().oldest('updatedAt').find()
    const latestUpdatedAt = await UserMongo.query().latest('updatedAt').find()

    assert.isTrue(oldestUpdatedAt.updatedAt < latestUpdatedAt.updatedAt)
  })

  test('should be able to find users if value is true', async ({ assert }) => {
    const trueValue = true

    const found = await UserMongo.query()
      .where('id', 0)
      .when(trueValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isDefined(found)

    const falseValue = false

    const notFound = await UserMongo.query()
      .where('id', 0)
      .when(falseValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isUndefined(notFound)
  })

  test('should be able to get users using OR queries', async ({ assert }) => {
    const whereUsers = await UserMongo.query()
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
      .orWhereExists(UserMongo.query().where('id', 1))
      .orWhereNotExists(UserMongo.query().where('id', 2))
      .findMany()

    assert.lengthOf(whereUsers, 10)
  })

  test('should be able to get users using GROUP BY and HAVING queries', async ({ assert }) => {
    const groupByUsers = await UserMongo.query()
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
      .orHavingExists(UserMongo.query().where('id', 1))
      .orHavingNotExists(UserMongo.query().where('id', 2))
      .findMany()

    assert.lengthOf(groupByUsers, 10)
  })

  test('should be able to create user and users using default attributes', async ({ assert }) => {
    const user = await UserMongo.query().select('*').create({ name: 'Hello 1' })
    const users = await UserMongo.query()
      .select('*')
      .createMany([{ name: 'Hello 2' }, {}])

    assert.isDefined(user.id)
    assert.isDefined(user.email)
    assert.deepEqual(user.name, 'Hello 1')

    users.forEach(user => {
      assert.isDefined(user.id)
      assert.isDefined(user.email)
    })
  })

  test('should be able to get fresh models', async ({ assert }) => {
    const user = await UserMongo.find()

    await UserMongo.update({ id: user.id }, { name: 'other-name' })

    const freshUser = await user.fresh()

    assert.notDeepEqual(user.name, freshUser.name)
  })

  test('should be able to refresh models', async ({ assert }) => {
    const { id } = await UserMongo.find()

    await ProductMongo.factory().count(2).create({ userId: id })

    const user = await UserMongo.query().where({ id }).with('products').find()

    user.name = 'other-name'
    user.products[0].name = 'other-product-name'

    await user.refresh()

    assert.notDeepEqual(user.name, 'other-name')
    assert.notDeepEqual(user.products[0].name, 'other-product-name')
    assert.notDeepEqual(user.products[1].name, 'other-product-name')
  })

  test('should be able to find user or execute a closure', async ({ assert }) => {
    const user = await UserMongo.findOr({}, async () => 'hello!')

    assert.isDefined(user.id)
    assert.isDefined(user.name)

    const notFoundUser = await UserMongo.findOr({ name: 'not-found' }, async () => 'hello!')

    assert.deepEqual(notFoundUser, 'hello!')
  })

  test('should be able to execute aggregates from the model', async ({ assert }) => {
    const min = await UserMongo.query().min('id')
    const max = await UserMongo.query().max('id')
    const avg = await UserMongo.query().avg('id')
    const avgDistinct = await UserMongo.query().avgDistinct('id')
    const sum = await UserMongo.query().sum('id')
    const sumDistinct = await UserMongo.query().sumDistinct('id')
    const count = await UserMongo.query().count('id')
    const countDistinct = await UserMongo.query().countDistinct('id')

    assert.isDefined(min)
    assert.isDefined(max)
    assert.isDefined(avg)
    assert.isDefined(avgDistinct)
    assert.isDefined(sum)
    assert.isDefined(sumDistinct)
    assert.isDefined(count)
    assert.isDefined(countDistinct)
  })

  test('should be able to create users from instance using save method', async ({ assert }) => {
    const user = new UserMongo()

    user.name = 'Valmir Barbosa'
    user.email = 'valmirphp@gmail.com'

    await user.save()

    assert.isDefined(user.id)
    assert.deepEqual(user.name, 'Valmir Barbosa')
    assert.deepEqual(user.email, 'valmirphp@gmail.com')
    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
  })

  test('should be able to delete models from instance', async ({ assert }) => {
    const user = await UserMongo.find()
    const userDeleted = await user.delete()

    assert.isDefined(userDeleted.deletedAt)

    const userDeletedForced = await user.delete(true)

    assert.isUndefined(userDeletedForced)
  })

  test('should be able to restore soft deleted models', async ({ assert }) => {
    const user = await UserMongo.find()
    const userDeleted = await user.delete()

    assert.isTrue(userDeleted.isTrashed())
    assert.isDefined(userDeleted.deletedAt)

    await userDeleted.restore()

    assert.isNull(userDeleted.deletedAt)
  })

  test('should be able to retrieve soft deleted models and only soft deleted', async ({ assert }) => {
    const toDelete = await UserMongo.query().limit(5).findMany()

    await Promise.all(toDelete.map(user => user.delete()))

    const withoutTrashed = await UserMongo.query().findMany()

    withoutTrashed.forEach(user => assert.isNull(user.deletedAt))

    const withTrashed = await UserMongo.query().withTrashed().findMany()

    assert.lengthOf(withTrashed, 10)

    const onlyTrashed = await UserMongo.query().onlyTrashed().findMany()

    onlyTrashed.forEach(user => assert.isDefined(user.deletedAt))
  })

  test('should be able to add, get and remove criterias from the model', async ({ assert }) => {
    UserMongo.addCriteria('select', Criteria.select('id').limit(5))
    UserMongo.addCriteria('orderBy', Criteria.orderBy('id', 'DESC').get())

    const users = await UserMongo.findMany()

    assert.lengthOf(users, 5)

    users.forEach(user => assert.isUndefined(user.name))

    let criterias = UserMongo.getCriterias()

    assert.isDefined(criterias.select)
    assert.isDefined(criterias.orderBy)

    UserMongo.removeCriteria('select')
    UserMongo.removeCriteria('orderBy')

    criterias = UserMongo.getCriterias()

    assert.isUndefined(criterias.select)
    assert.isUndefined(criterias.orderBy)
  })

  test('should be able to transform to json the relations included in the model', async ({ assert }) => {
    const { id } = await UserMongo.query().find()
    await ProductMongo.factory().create({ userId: id })

    const user = await UserMongo.query().with('products').find()
    const userJson = user.toJSON()

    assert.notInstanceOf(userJson.products[0], ProductMongo)
  })

  test('should be able to load relations after fetching the main model', async ({ assert }) => {
    const user = await UserMongo.find()
    await ProductMongo.factory().create({ userId: user.id })

    const products = await user.load('products')

    assert.isDefined(user.products)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should throw an exception when trying to load a relation that does not exist', async ({ assert }) => {
    const user = await UserMongo.find()

    await assert.rejects(() => user.load('not-found'), NotImplementedRelationException)
  })

  test('should be able to reload relations even if it is already loaded', async ({ assert }) => {
    const { id: userId } = await UserMongo.find()
    await ProductMongo.factory().create({ userId })

    const user = await UserMongo.query().where('id', userId).with('products').find()
    const products = await user.load('products', query => query.select('id'))

    assert.isDefined(user.products)
    assert.isUndefined(products[0].name)
    assert.isUndefined(user.products[0].name)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should be able to load relations after fetching the main model making sub queries', async ({ assert }) => {
    const user = await UserMongo.find()
    await ProductMongo.factory().create({ userId: user.id })

    const products = await user.load('products', query => query.select('id'))

    assert.isDefined(user.products)
    assert.isUndefined(products[0].name)
    assert.isUndefined(user.products[0].name)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should be able to load nested relations using with method', async ({ assert }) => {
    const { id: userId } = await UserMongo.find()
    const { id: productId } = await ProductMongo.factory().create({ userId })
    await ProductDetailMongo.factory().count(2).create({ productId })

    const user = await UserMongo.query().with('products.productDetails').where('id', userId).find()

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to load nested relations using with method and use a callback', async ({ assert }) => {
    const { id: userId } = await UserMongo.find()
    const { id: productId } = await ProductMongo.factory().create({ userId })
    await ProductDetailMongo.factory().count(2).create({ productId })

    const user = await UserMongo.query()
      .with('products.productDetails', query => query.select('id', 'productId'))
      .where('id', userId)
      .find()

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.isUndefined(user.products[0].productDetails[0].content)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to load nested relations using load instance method', async ({ assert }) => {
    const user = await UserMongo.find()
    const { id: productId } = await ProductMongo.factory().create({ userId: user.id })
    await ProductDetailMongo.factory().count(2).create({ productId })

    await user.load('products.productDetails')

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to load nested relations using with method and use a callback', async ({ assert }) => {
    const user = await UserMongo.find()
    const { id: productId } = await ProductMongo.factory().create({ userId: user.id })
    await ProductDetailMongo.factory().count(2).create({ productId })

    await user.load('products.productDetails', query => query.select('id', 'productId'))

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.isUndefined(user.products[0].productDetails[0].content)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to find relations using it queries from models', async ({ assert }) => {
    const user = await UserMongo.find()
    await ProductMongo.factory().count(2).create({ userId: user.id })

    const products = await user.productsQuery().findMany()

    products.forEach(product => product.userId === user.id)
  })

  test('should be able to create relations using it queries from models', async ({ assert }) => {
    const user = await UserMongo.find()
    const product = await user.productsQuery().create({ name: 'GTR' })

    await user.load('products')

    assert.deepEqual(product.name, 'GTR')
    assert.deepEqual(product.userId, user.id)
    assert.deepEqual(product, user.products[0])
  })

  test('should be able to find models only where has the relations', async ({ assert }) => {
    const [userOne, userTwo] = await UserMongo.query().findMany()
    await userOne.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }])
    await userTwo.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }, { name: 'GTR35' }])

    const twoUsers = await UserMongo.query().has('products').findMany()

    assert.lengthOf(twoUsers, 2)

    const oneUser = await UserMongo.query().has('products', '>=', 3).findMany()

    assert.lengthOf(oneUser, 1)

    const emptyUsers = await UserMongo.query().has('products', '>=', 4).findMany()

    assert.lengthOf(emptyUsers, 0)
  })

  test('should be able to find models only where has the relations and using callback queries', async ({ assert }) => {
    const [userOne, userTwo] = await UserMongo.query().findMany()
    await userOne.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }])
    await userTwo.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }, { name: 'GTR35' }])

    const twoUsers = await UserMongo.query()
      .whereHas('products', query => query.with('productDetails').orderBy('name', 'DESC'))
      .findMany()

    assert.lengthOf(twoUsers, 2)
    twoUsers.forEach(user => {
      const last = user.products.length - 1

      assert.deepEqual(user.products[last].name, 'GTR33')

      user.products.forEach(product => assert.isDefined(product.productDetails))
    })

    const oneUser = await UserMongo.query()
      .whereHas('products', query => query.orderBy('name', 'DESC'), '>=', 3)
      .findMany()

    assert.lengthOf(oneUser, 1)
    assert.deepEqual(oneUser[0].products[0].name, 'GTR35')

    const emptyUsers = await UserMongo.query()
      .whereHas('products', query => query.where('name', 'not-found'))
      .findMany()

    assert.lengthOf(emptyUsers, 0)
  })

  test('should be able to find models only where has the nested relations', async ({ assert }) => {
    const [userOne, userTwo] = await UserMongo.query().findMany()
    const productsOne = await userOne.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }])
    await Promise.all(
      productsOne.map(product =>
        product
          .productDetailsQuery()
          .createMany([{ content: 'detail1' }, { content: 'detail2' }, { content: 'detail3' }, { content: 'detail4' }]),
      ),
    )
    const productsTwo = await userTwo
      .productsQuery()
      .createMany([{ name: 'GTR33' }, { name: 'GTR34' }, { name: 'GTR35' }])
    await Promise.all(
      productsTwo.map(product =>
        product
          .productDetailsQuery()
          .createMany([
            { content: 'detail5' },
            { content: 'detail6' },
            { content: 'detail7' },
            { content: 'detail8' },
            { content: 'detail9' },
            { content: 'detail10' },
          ]),
      ),
    )

    const twoUsers = await UserMongo.query().has('products.productDetails').findMany()

    assert.lengthOf(twoUsers, 2)

    const oneUser = await UserMongo.query().has('products.productDetails', '>=', 6).findMany()

    assert.lengthOf(oneUser, 1)

    const emptyUsers = await UserMongo.query().has('products.productDetails', '>=', 7).findMany()

    assert.lengthOf(emptyUsers, 0)
  })

  test('should be able to find models only where has the nested relations and using callback queries', async ({
    assert,
  }) => {
    const [userOne, userTwo] = await UserMongo.query().findMany()
    const productsOne = await userOne.productsQuery().createMany([{ name: 'GTR33' }, { name: 'GTR34' }])
    await Promise.all(
      productsOne.map(product =>
        product
          .productDetailsQuery()
          .createMany([{ content: 'detail1' }, { content: 'detail2' }, { content: 'detail3' }, { content: 'detail4' }]),
      ),
    )
    const productsTwo = await userTwo
      .productsQuery()
      .createMany([{ name: 'GTR33' }, { name: 'GTR34' }, { name: 'GTR35' }])
    await Promise.all(
      productsTwo.map(product =>
        product
          .productDetailsQuery()
          .createMany([
            { content: 'detail5' },
            { content: 'detail6' },
            { content: 'detail7' },
            { content: 'detail8' },
            { content: 'detail9' },
            { content: 'detail99' },
          ]),
      ),
    )

    const twoUsers = await UserMongo.query()
      .whereHas('products.productDetails', query => query.orderBy('content', 'DESC'))
      .findMany()

    assert.lengthOf(twoUsers, 2)
    twoUsers[0].products.forEach(product => {
      assert.isDefined(product.productDetails)
      assert.deepEqual(product.productDetails[0].content, 'detail4')
    })

    const oneUser = await UserMongo.query()
      .whereHas('products.productDetails', query => query.orderBy('content', 'ASC'), '>=', 6)
      .findMany()

    assert.lengthOf(oneUser, 1)
    oneUser[0].products.forEach(product => {
      assert.isDefined(product.productDetails)
      assert.deepEqual(product.productDetails[0].content, 'detail5')
    })

    const emptyUsers = await UserMongo.query()
      .whereHas('products.productDetails', query => query.where('content', 'not-found'), '>=', 7)
      .findMany()

    assert.lengthOf(emptyUsers, 0)
  })

  test('should be able to convert relationships in resources', async ({ assert }) => {
    await ProductMongo.factory().create()

    const users = await UserMongo.query().has('products').findMany()
    const json = users.toResource()

    assert.isDefined(json[0].id)
    assert.isDefined(json[0].name)
    assert.isUndefined(json[0].createdAt)
    assert.isDefined(json[0].products)
    assert.isDefined(json[0].products[0].id)
    assert.isDefined(json[0].products[0].name)
    assert.isUndefined(json[0].products[0].createdAt)
  })

  test('should be able to fabricate trashed data using factories', async ({ assert }) => {
    const factory = UserMongo.factory()

    const userMake = await factory.trashed().make()
    const userCreate = await factory.trashed().create()

    assert.isDefined(userMake.deletedAt)
    assert.instanceOf(userMake, UserMongo)
    assert.isDefined(userCreate.deletedAt)
    assert.instanceOf(userCreate, UserMongo)
    assert.isTrue(userCreate.isTrashed())
    await UserMongo.assertSoftDelete({ id: userCreate.id })

    const notDeletedUser = await factory.untrashed().create()

    assert.isNull(notDeletedUser.deletedAt)
    await UserMongo.assertNotSoftDelete({ id: notDeletedUser.id })
  })
})
