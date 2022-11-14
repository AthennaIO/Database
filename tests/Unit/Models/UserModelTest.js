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
import { User } from '#tests/Stubs/models/User'
import { Product } from '#tests/Stubs/models/Product'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { UserResource } from '#tests/Stubs/app/Resources/UserResource'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'
import { ProductDetail } from '#tests/Stubs/models/ProductDetail'

test.group('UserModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    await User.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.closeAll()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to create user and users', async ({ assert }) => {
    const user = await User.create({
      name: 'João Lenon',
      email: 'lenonSec7@gmail.com',
    })

    assert.isDefined(user.createdAt)
    assert.isDefined(user.updatedAt)
    assert.isNull(user.deletedAt)

    const users = await User.createMany([
      { name: 'Victor Tesoura', email: 'txsoura@gmail.com' },
      { name: 'Henry Bernardo', email: 'hbplay@gmail.com' },
    ])

    assert.lengthOf(users, 2)
  })

  test('should be able to create or update user', async ({ assert }) => {
    const userCreated = await User.createOrUpdate(
      { name: 'João Lenon' },
      {
        name: 'João Lenon',
        email: 'lenonSec7@gmail.com',
      },
    )

    assert.isDefined(userCreated.createdAt)
    assert.isDefined(userCreated.updatedAt)
    assert.isNull(userCreated.deletedAt)

    const userUpdated = await User.createOrUpdate(
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
    const user = await User.find()

    assert.isUndefined(user.email)

    const users = await User.query().select('*').whereIn('id', [user.id]).orderBy('id', 'DESC').findMany()

    assert.lengthOf(users, 1)
    assert.isDefined(users[0].email)
    assert.deepEqual(users[0].id, user.id)

    const allUsers = await User.findMany()

    assert.lengthOf(allUsers, 10)
  })

  test('should be able to find user and users grouped', async ({ assert }) => {
    const users = await User.query()
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
    const collection = await User.query().orderBy('id', 'DESC').collection()

    const users = collection.all()

    assert.lengthOf(users, 10)
    assert.isDefined(users[0].name)
    assert.isDefined(users[1].name)

    const otherCollection = await User.collection()
    const allUsers = otherCollection.all()

    assert.lengthOf(allUsers, 10)
  })

  test('should be able to find user and fail', async ({ assert }) => {
    const user = await User.findOrFail()

    assert.isDefined(user.id)
    assert.isUndefined(user.email)

    await assert.rejects(() => User.findOrFail({ id: 123459 }), NotFoundDataException)
  })

  test('should be able to find user using query builder', async ({ assert }) => {
    await User.truncate()

    const createdAt = new Date(Date.now() - 100000)

    await User.factory().create({ name: 'João', createdAt })
    await User.factory().create({ name: 'joão lenon', createdAt })
    await User.factory().create({ name: 'Victor', createdAt })
    await User.factory().create({ name: 'victor tesoura' })

    assert.lengthOf(await User.query().whereLike('name', 'João%').findMany(), 1)
    assert.lengthOf(await User.query().whereILike('name', 'João%').findMany(), 2)
    assert.lengthOf(await User.query().whereNot('name', 'João').findMany(), 3)
    assert.lengthOf(await User.query().whereNotIn('name', ['João', 'Victor']).findMany(), 2)

    await User.query().whereILike('name', 'joão%').update({ deletedAt: new Date() }, true)

    assert.lengthOf(await User.query().removeCriteria('deletedAt').whereNotNull('deletedAt').findMany(), 2)

    assert.lengthOf(
      await User.query().removeCriteria('deletedAt').whereBetween('createdAt', [createdAt, new Date()]).findMany(),
      3,
    )

    assert.lengthOf(
      await User.query().removeCriteria('deletedAt').whereNotBetween('createdAt', [createdAt, new Date()]).findMany(),
      1,
    )
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await User.paginate()

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
    const { id, createdAt } = await User.create({ name: 'João Lenon' })

    const user = await User.update({ id }, { name: 'João Lenon Updated', createdAt: new Date() })

    assert.deepEqual(user.createdAt, createdAt)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const usersDates = await User.query().findMany()
    const users = await User.query()
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
    const user = await User.create({ name: 'João Lenon' })

    const createdAt = new Date()

    user.name = 'João Lenon Updated'
    user.createdAt = createdAt

    await user.save()

    assert.deepEqual(user.name, 'João Lenon Updated')
    assert.notEqual(user.createdAt, createdAt)
    assert.lengthOf(await User.findMany({ name: 'João Lenon Updated' }), 1)

    const users = await User.findMany()

    users[0].name = 'João Lenon Array Updated'
    users[0].createdAt = createdAt

    await users[0].save()

    assert.deepEqual(users[0].name, 'João Lenon Array Updated')
    assert.notEqual(users[0].createdAt, createdAt)
    assert.lengthOf(await User.findMany({ name: 'João Lenon Array Updated' }), 1)
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => User.update({}), EmptyWhereException)
  })

  test('should be able to delete/softDelete user and users', async ({ assert }) => {
    await User.delete({ id: 3 }, true)

    const notFoundUser = await User.find({ id: 3 })

    assert.isUndefined(notFoundUser)

    const { id } = await User.find()
    await User.query().where({ id }).delete()

    const users = await User.query().removeCriteria('deletedAt').where('id', id).findMany()

    assert.lengthOf(users, 1)

    assert.deepEqual(users[0].id, id)
    assert.isDefined(users[0].deletedAt)
  })

  test('should throw a empty where exception on delete without where', async ({ assert }) => {
    await assert.rejects(() => User.delete({}), EmptyWhereException)
  })

  test('should be able to add products to user', async ({ assert }) => {
    const userId = await User.factory('id').create()
    const { id } = await Product.create({ name: 'iPhone X', userId })

    const user = await User.query().where({ id: userId }).with('products').find()

    assert.deepEqual(user.products[0].id, id)
    assert.deepEqual(user.products[0].name, 'iPhone X')
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const userId = await User.factory('id').create()
    await Product.factory().count(5).create({ userId })
    await Product.factory().count(5).create({ userId, deletedAt: new Date() })

    const user = await User.query()
      .select('id', 'name')
      .where('id', userId)
      .with('products', query => query.select('id', 'name').whereNull('deletedAt').orderBy('id', 'DESC'))
      .find()

    assert.deepEqual(user.id, userId)
    assert.lengthOf(user.products, 5)

    user.products[0].name = 'MacOS'

    await user.products[0].save()

    const product = await Product.find({ name: 'MacOS' })

    assert.deepEqual(user.products[0].id, product.id)
  })

  test('should be able to make database assertions', async () => {
    const userId = await User.factory('id').create()
    await Product.factory().count(5).create({ userId })
    await Product.factory().count(5).create({ userId, deletedAt: new Date() })

    await User.assertExists({ id: userId })
    await Product.assertCount(5)
    await Product.assertSoftDelete({ userId })
  })

  test('should be able to get the user as JSON', async ({ assert }) => {
    const [user] = await User.query().with('products').findMany()

    const userJson = user.toJSON()

    assert.notInstanceOf(userJson, User)
  })

  test('should be able to get the user/users as resource', async ({ assert }) => {
    const users = await User.query().with('products').findMany()

    const userResource = users[0].toResource()

    assert.notInstanceOf(userResource, User)

    assert.isUndefined(userResource.createdAt)
    assert.isUndefined(users.toResource({ role: 'admin' })[0].createdAt)
  })

  test('should be able to get the user/users as resource using resource class', async ({ assert }) => {
    const users = await User.query().with('products').findMany()

    const userResource = UserResource.toJson(users[0])

    assert.notInstanceOf(userResource, User)

    assert.isUndefined(userResource.createdAt)
    assert.isUndefined(UserResource.toArray(users)[0].createdAt)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => User.query().with('notImplemented'), NotImplementedRelationException)
  })

  test('should be able to find users ordering by latest and oldest', async ({ assert }) => {
    const oldestCreatedAt = await User.query().oldest().find()
    const latestCreatedAt = await User.query().latest().find()

    assert.isTrue(oldestCreatedAt.createdAt < latestCreatedAt.createdAt)
  })

  test('should be able to find users ordering by latest and oldest with different columns', async ({ assert }) => {
    const oldestUpdatedAt = await User.query().oldest('updatedAt').find()
    const latestUpdatedAt = await User.query().latest('updatedAt').find()

    assert.isTrue(oldestUpdatedAt.updatedAt < latestUpdatedAt.updatedAt)
  })

  test('should be able to find users if value is true', async ({ assert }) => {
    const trueValue = true

    const found = await User.query()
      .where('id', 0)
      .when(trueValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isDefined(found)

    const falseValue = false

    const notFound = await User.query()
      .where('id', 0)
      .when(falseValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isUndefined(notFound)
  })

  test('should be able to get users using OR queries', async ({ assert }) => {
    const whereUsers = await User.query()
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
      .orWhereExists(User.query().where('id', 1))
      .orWhereNotExists(User.query().where('id', 2))
      .findMany()

    assert.lengthOf(whereUsers, 10)
  })

  test('should be able to get users using GROUP BY and HAVING queries', async ({ assert }) => {
    const groupByUsers = await User.query()
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
      .orHavingExists(User.query().where('id', 1))
      .orHavingNotExists(User.query().where('id', 2))
      .findMany()

    assert.lengthOf(groupByUsers, 10)
  })

  test('should be able to create user and users using default attributes', async ({ assert }) => {
    const user = await User.query().select('*').create({ name: 'Hello 1' })
    const users = await User.query()
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
    const user = await User.find()

    await User.update({ id: user.id }, { name: 'other-name' })

    const freshUser = await user.fresh()

    assert.notDeepEqual(user.name, freshUser.name)
  })

  test('should be able to refresh models', async ({ assert }) => {
    const { id } = await User.find()

    await Product.factory().count(2).create({ userId: id })

    const user = await User.query().where({ id }).with('products').find()

    user.name = 'other-name'
    user.products[0].name = 'other-product-name'

    await user.refresh()

    assert.notDeepEqual(user.name, 'other-name')
    assert.notDeepEqual(user.products[0].name, 'other-product-name')
    assert.notDeepEqual(user.products[1].name, 'other-product-name')
  })

  test('should be able to find user or execute a closure', async ({ assert }) => {
    const user = await User.findOr({}, async () => 'hello!')

    assert.isDefined(user.id)
    assert.isDefined(user.name)

    const notFoundUser = await User.findOr({ name: 'not-found' }, async () => 'hello!')

    assert.deepEqual(notFoundUser, 'hello!')
  })

  test('should be able to execute aggregates from the model', async ({ assert }) => {
    const min = await User.query().min('id')
    const max = await User.query().max('id')
    const avg = await User.query().avg('id')
    const avgDistinct = await User.query().avgDistinct('id')
    const sum = await User.query().sum('id')
    const sumDistinct = await User.query().sumDistinct('id')
    const count = await User.query().count('id')
    const countDistinct = await User.query().countDistinct('id')

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
    const user = new User()

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
    const user = await User.find()
    const userDeleted = await user.delete()

    assert.isDefined(userDeleted.deletedAt)

    const userDeletedForced = await user.delete(true)

    assert.isUndefined(userDeletedForced)
  })

  test('should be able to restore soft deleted models', async ({ assert }) => {
    const user = await User.find()
    const userDeleted = await user.delete()

    assert.isTrue(userDeleted.isTrashed())
    assert.isDefined(userDeleted.deletedAt)

    await userDeleted.restore()

    assert.isNull(userDeleted.deletedAt)
  })

  test('should be able to retrieve soft deleted models and only soft deleted', async ({ assert }) => {
    const toDelete = await User.query().limit(5).findMany()

    await Promise.all(toDelete.map(user => user.delete()))

    const withoutTrashed = await User.query().findMany()

    withoutTrashed.forEach(user => assert.isNull(user.deletedAt))

    const withTrashed = await User.query().withTrashed().findMany()

    assert.lengthOf(withTrashed, 10)

    const onlyTrashed = await User.query().onlyTrashed().findMany()

    onlyTrashed.forEach(user => assert.isDefined(user.deletedAt))
  })

  test('should be able to add, get and remove criterias from the model', async ({ assert }) => {
    User.addCriteria('select', Criteria.select('id').limit(5))
    User.addCriteria('orderBy', Criteria.orderBy('id', 'DESC').get())

    const users = await User.findMany()

    assert.lengthOf(users, 5)

    users.forEach(user => assert.isUndefined(user.name))

    let criterias = User.getCriterias()

    assert.isDefined(criterias.select)
    assert.isDefined(criterias.orderBy)

    User.removeCriteria('select')
    User.removeCriteria('orderBy')

    criterias = User.getCriterias()

    assert.isUndefined(criterias.select)
    assert.isUndefined(criterias.orderBy)
  })

  test('should be able to transform to json the relations included in the model', async ({ assert }) => {
    const { id } = await User.query().find()
    await Product.factory().create({ userId: id })

    const user = await User.query().with('products').find()
    const userJson = user.toJSON()

    assert.notInstanceOf(userJson.products[0], Product)
  })

  test('should be able to load relations after fetching the main model', async ({ assert }) => {
    const user = await User.find()
    await Product.factory().create({ userId: user.id })

    const products = await user.load('products')

    assert.isDefined(user.products)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should throw an exception when trying to load a relation that does not exist', async ({ assert }) => {
    const user = await User.find()

    await assert.rejects(() => user.load('not-found'), NotImplementedRelationException)
  })

  test('should be able to reload relations even if it is already loaded', async ({ assert }) => {
    const { id: userId } = await User.find()
    await Product.factory().create({ userId })

    const user = await User.query().where('id', userId).with('products').find()
    const products = await user.load('products', query => query.select('id'))

    assert.isDefined(user.products)
    assert.isUndefined(products[0].name)
    assert.isUndefined(user.products[0].name)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should be able to load relations after fetching the main model making sub queries', async ({ assert }) => {
    const user = await User.find()
    await Product.factory().create({ userId: user.id })

    const products = await user.load('products', query => query.select('id'))

    assert.isDefined(user.products)
    assert.isUndefined(products[0].name)
    assert.isUndefined(user.products[0].name)
    assert.deepEqual(products[0].id, user.products[0].id)
  })

  test('should be able to load nested relations using with method', async ({ assert }) => {
    const { id: userId } = await User.find()
    const { id: productId } = await Product.factory().create({ userId })
    await ProductDetail.factory().count(2).create({ productId })

    const user = await User.query().with('products.productDetails').where('id', userId).find()

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to load nested relations using with method and use a callback', async ({ assert }) => {
    const { id: userId } = await User.find()
    const { id: productId } = await Product.factory().create({ userId })
    await ProductDetail.factory().count(2).create({ productId })

    const user = await User.query()
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
    const user = await User.find()
    const { id: productId } = await Product.factory().create({ userId: user.id })
    await ProductDetail.factory().count(2).create({ productId })

    await user.load('products.productDetails')

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to load nested relations using with method and use a callback', async ({ assert }) => {
    const user = await User.find()
    const { id: productId } = await Product.factory().create({ userId: user.id })
    await ProductDetail.factory().count(2).create({ productId })

    await user.load('products.productDetails', query => query.select('id', 'productId'))

    assert.isDefined(user.products)
    assert.isDefined(user.products[0].productDetails)
    assert.isDefined(user.products[0].productDetails[0].id)
    assert.isUndefined(user.products[0].productDetails[0].content)
    assert.lengthOf(user.products[0].productDetails, 2)
  })

  test('should be able to find relations using it queries from models', async ({ assert }) => {
    const user = await User.find()
    await Product.factory().count(2).create({ userId: user.id })

    const products = await user.productsQuery().findMany()

    products.forEach(product => product.userId === user.id)
  })
})
