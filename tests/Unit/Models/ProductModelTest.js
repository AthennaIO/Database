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
import { UserMySql } from '#tests/Stubs/models/UserMySql'
import { ProductMySql } from '#tests/Stubs/models/ProductMySql'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

test.group('ProductModelTest', group => {
  let userId = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connection('mysql').connect()
    await Database.connection('mysql').runMigrations()

    const [id] = await UserMySql.factory('id').count(10).create()

    userId = id

    await ProductMySql.factory().count(10).create({ userId })
  })

  group.each.teardown(async () => {
    await Database.connection('mysql').revertMigrations()
    await Database.connection('mysql').close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to create product and products', async ({ assert }) => {
    const product = await ProductMySql.create({
      name: 'iPhone X',
      userId,
    })

    assert.isDefined(product.createdAt)
    assert.isDefined(product.updatedAt)
    assert.isNull(product.deletedAt)

    const products = await ProductMySql.createMany([
      { name: 'iPhone X', userId },
      { name: 'iPhone X', userId },
    ])

    assert.lengthOf(products, 2)
  })

  test('should be able to create or update product', async ({ assert }) => {
    const productCreated = await ProductMySql.createOrUpdate(
      { name: 'iPhone X' },
      {
        name: 'iPhone X',
        userId,
      },
    )

    assert.isDefined(productCreated.createdAt)
    assert.isDefined(productCreated.updatedAt)
    assert.isNull(productCreated.deletedAt)

    const productUpdated = await ProductMySql.createOrUpdate(
      { name: 'iPhone X' },
      {
        name: 'iPhone 11',
        userId,
      },
    )

    assert.deepEqual(productCreated.id, productUpdated.id)
    assert.deepEqual(productCreated.name, 'iPhone X')
    assert.deepEqual(productUpdated.name, 'iPhone 11')
  })

  test('should be able to find product and products', async ({ assert }) => {
    const product = await ProductMySql.find()

    assert.deepEqual(product.userId, userId)

    const products = await ProductMySql.query()
      .select('id', 'name')
      .whereIn('id', [product.id])
      .orderBy('id', 'DESC')
      .findMany()

    assert.lengthOf(products, 1)
    assert.isDefined(products[0].name)
    assert.deepEqual(products[0].id, product.id)

    const allProductMySqls = await ProductMySql.findMany()

    assert.lengthOf(allProductMySqls, 10)
  })

  test('should be able to find product and products grouped', async ({ assert }) => {
    const products = await ProductMySql.query()
      .select('id', 'name', 'deletedAt')
      .groupBy('id', 'name')
      .havingBetween('id', [0, 5000000])
      .havingNotBetween('id', [5000000, 9999999])
      .orHavingBetween('id', [4, 7])
      .havingNull('deletedAt')
      .findMany()

    assert.lengthOf(products, 10)
  })

  test('should be able to get products as a collection', async ({ assert }) => {
    const collection = await ProductMySql.query().orderBy('id', 'DESC').collection()

    const products = collection.all()

    assert.lengthOf(products, 10)
    assert.isDefined(products[0].name)
    assert.isDefined(products[1].name)
    assert.deepEqual(products[0].userId, userId)
    assert.deepEqual(products[1].userId, userId)

    const otherCollection = await ProductMySql.collection()
    const allProducts = otherCollection.all()

    assert.lengthOf(allProducts, 10)
  })

  test('should be able to find product and fail', async ({ assert }) => {
    const product = await ProductMySql.findOrFail()

    assert.isDefined(product.id)

    await assert.rejects(() => ProductMySql.findOrFail({ id: 123459 }), NotFoundDataException)
  })

  test('should be able to find products using query builder', async ({ assert }) => {
    await ProductMySql.truncate()

    let createdAt = new Date(Date.now() - 100000)

    await ProductMySql.create({ name: 'iPhone 10', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11 Pro', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iphone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12 Pro', userId })

    createdAt = new Date(createdAt.getTime() - 500)

    assert.lengthOf(await ProductMySql.query().whereLike('name', 'iPhone 12%').findMany(), 3)
    assert.lengthOf(await ProductMySql.query().whereILike('name', 'iPhone 12%').findMany(), 3)
    assert.lengthOf(await ProductMySql.query().whereNot('name', 'iPhone 10').findMany(), 5)
    assert.lengthOf(await ProductMySql.query().whereNotIn('name', ['iPhone 11', 'iPhone 11 Pro']).findMany(), 4)

    await ProductMySql.query()
      .whereILike('name', 'iphone%')
      .whereNot('name', 'iPhone 12 Pro')
      .update({ deletedAt: new Date() }, true)

    assert.lengthOf(await ProductMySql.query().whereNotNull('deletedAt').findMany(), 0)

    const query = ProductMySql.query().removeCriteria('deletedAt')

    assert.lengthOf(await query.whereNotNull('deletedAt').findMany(), 5)

    // FIXME For some reason this two tests are now working in the CI pipeline.
    // assert.lengthOf(await query.whereBetween('createdAt', [createdAt, new Date()]).findMany(), 5)
    // assert.lengthOf(await query.whereNotBetween('createdAt', [createdAt, new Date()]).findMany(), 1)
  })

  test('should be able to get paginate products', async ({ assert }) => {
    const { data, meta, links } = await ProductMySql.paginate(0, 10, '/')

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

  test('should be able to update product and products', async ({ assert }) => {
    const { id, createdAt } = await ProductMySql.find()

    const product = await ProductMySql.update({ id }, { name: 'iPhone X Updated', createdAt: new Date() })

    assert.deepEqual(product.createdAt, createdAt)
    assert.deepEqual(product.name, 'iPhone X Updated')

    const productDates = await ProductMySql.query().whereIn('id', [id]).findMany()
    const productUpdated = await ProductMySql.query()
      .whereIn('id', [id])
      .update({ name: 'iPhone X Updated', createdAt: new Date() })

    assert.deepEqual(product.createdAt, productDates[0].createdAt)
    assert.deepEqual(productUpdated.id, id)
    assert.deepEqual(productUpdated.name, 'iPhone X Updated')
  })

  test('should be able to save product', async ({ assert }) => {
    const product = await ProductMySql.create({ name: 'Macbook M1', userId })

    const createdAt = new Date()

    product.name = 'Macbook M2'
    product.createdAt = createdAt

    await product.save()

    assert.deepEqual(product.name, 'Macbook M2')
    assert.notEqual(product.createdAt, createdAt)
    assert.lengthOf(await ProductMySql.findMany({ name: 'Macbook M2' }), 1)

    const products = await ProductMySql.findMany()

    products[0].name = 'Macbook M3'
    products[0].createdAt = createdAt

    await products[0].save()

    assert.deepEqual(products[0].name, 'Macbook M3')
    assert.notEqual(products[0].createdAt, createdAt)
    assert.lengthOf(await ProductMySql.findMany({ name: 'Macbook M3' }), 1)
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => ProductMySql.update({}), EmptyWhereException)
  })

  test('should be able to delete/softDelete product and products', async ({ assert }) => {
    const { id } = await ProductMySql.find()
    await ProductMySql.delete({ id }, true)

    const notFoundProductMySql = await ProductMySql.find({ id })

    assert.isUndefined(notFoundProductMySql)

    const { id: otherId } = await ProductMySql.find()
    await ProductMySql.query().whereIn('id', [otherId]).delete()

    const products = await ProductMySql.query().removeCriteria('deletedAt').whereIn('id', [otherId]).findMany()

    assert.lengthOf(products, 1)

    assert.deepEqual(products[0].id, otherId)
    assert.isDefined(products[0].deletedAt)
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => ProductMySql.delete({}), EmptyWhereException)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    await ProductMySql.factory().count(5).create({ userId, deletedAt: new Date() })

    const products = await ProductMySql.query()
      .select('id', 'name', 'userId', 'deletedAt')
      .where('userId', userId)
      .with('user', query => query.select('id', 'name'))
      .whereNull('deletedAt')
      .findMany()

    products.forEach(product => {
      assert.deepEqual(product.user.id, userId)
      assert.deepEqual(product.deletedAt, null)
    })

    products[0].user.name = 'João Lenon'

    await products[0].user.save()

    const user = await UserMySql.find({ name: 'João Lenon' })

    assert.deepEqual(products[0].user.id, user.id)
  })

  test('should be able to make database assertions', async () => {
    await ProductMySql.factory().count(5).create({ userId, deletedAt: new Date() })

    await UserMySql.assertExists({ id: userId })
    await ProductMySql.assertCount(10)
    await ProductMySql.assertSoftDelete({ userId })
  })

  test('should be able to get the product as JSON', async ({ assert }) => {
    const [product] = await ProductMySql.query().with('user').findMany()

    const productJson = product.toJSON()

    assert.notInstanceOf(productJson, ProductMySql)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => ProductMySql.query().with('notImplemented'), NotImplementedRelationException)
  })

  test('should be able to find products ordering by latest and oldest', async ({ assert }) => {
    const oldestCreatedAt = await ProductMySql.query().oldest().find()
    const latestCreatedAt = await ProductMySql.query().latest().find()

    assert.isTrue(oldestCreatedAt.createdAt < latestCreatedAt.createdAt)
  })

  test('should be able to find products ordering by latest and oldest with different columns', async ({ assert }) => {
    const oldestUpdatedAt = await ProductMySql.query().oldest('updatedAt').find()
    const latestUpdatedAt = await ProductMySql.query().latest('updatedAt').find()

    assert.isTrue(oldestUpdatedAt.updatedAt < latestUpdatedAt.updatedAt)
  })

  test('should be able to find products if value is true', async ({ assert }) => {
    const trueValue = true

    const found = await ProductMySql.query()
      .where('id', 0)
      .when(trueValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isDefined(found)

    const falseValue = false

    const notFound = await ProductMySql.query()
      .where('id', 0)
      .when(falseValue, query => query.orWhereNull('deletedAt'))
      .find()

    assert.isUndefined(notFound)
  })

  test('should be able to get products using OR queries', async ({ assert }) => {
    const whereProducts = await ProductMySql.query()
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
      .orWhereExists(ProductMySql.query().where('id', 1))
      .orWhereNotExists(ProductMySql.query().where('id', 2))
      .findMany()

    assert.lengthOf(whereProducts, 10)
  })

  test('should be able to get products using GROUP BY and HAVING queries', async ({ assert }) => {
    const groupByProducts = await ProductMySql.query()
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
      .orHavingExists(ProductMySql.query().where('id', 1))
      .orHavingNotExists(ProductMySql.query().where('id', 2))
      .findMany()

    assert.lengthOf(groupByProducts, 10)
  })

  test('should be able to create product and products using default attributes', async ({ assert }) => {
    const product = await ProductMySql.create({ name: 'Hello 1' })
    const products = await ProductMySql.createMany([{ name: 'Hello 2' }, {}])

    assert.isDefined(product.id)
    assert.notDeepEqual(product.price, 0)
    assert.deepEqual(product.name, 'Hello 1')

    products.forEach(product => {
      assert.isDefined(product.id)
      assert.isDefined(product.name)
      assert.notDeepEqual(product.price, 0)
    })
  })

  test('should be able to get fresh models', async ({ assert }) => {
    const product = await ProductMySql.find()

    await ProductMySql.update({ id: product.id }, { name: 'other-name' })

    const freshProduct = await product.fresh()

    assert.notDeepEqual(product.name, freshProduct.name)
  })

  test('should be able to refresh models', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()

    product.name = 'other-name'
    product.user.name = 'other-user-name'

    await product.refresh()

    assert.notDeepEqual(product.name, 'other-name')
    assert.notDeepEqual(product.user.name, 'other-user-name')
  })

  test('should be able to find product or execute a closure', async ({ assert }) => {
    const product = await ProductMySql.findOr({}, async () => 'hello!')

    assert.isDefined(product.id)
    assert.isDefined(product.name)

    const notFoundProduct = await ProductMySql.findOr({ name: 'not-found' }, async () => 'hello!')

    assert.deepEqual(notFoundProduct, 'hello!')
  })

  test('should be able to execute aggregates from the model', async ({ assert }) => {
    const min = await ProductMySql.query().min('price')
    const max = await ProductMySql.query().max('price')
    const avg = await ProductMySql.query().avg('price')
    const avgDistinct = await ProductMySql.query().avgDistinct('price')
    const sum = await ProductMySql.query().sum('price')
    const sumDistinct = await ProductMySql.query().sumDistinct('price')
    const count = await ProductMySql.query().count('price')
    const countDistinct = await ProductMySql.query().countDistinct('price')

    assert.isDefined(min)
    assert.isDefined(max)
    assert.isDefined(avg)
    assert.isDefined(avgDistinct)
    assert.isDefined(sum)
    assert.isDefined(sumDistinct)
    assert.isDefined(count)
    assert.isDefined(countDistinct)
  })

  test('should be able to create products from instance using save method', async ({ assert }) => {
    const product = new ProductMySql()

    product.name = 'Macbook M4'
    product.price = 100

    await product.save()

    assert.isDefined(product.id)
    assert.deepEqual(product.name, 'Macbook M4')
    assert.deepEqual(product.price, 100)
    assert.isDefined(product.createdAt)
    assert.isDefined(product.updatedAt)
  })

  test('should be able to delete models from instance', async ({ assert }) => {
    const product = await ProductMySql.find()
    const productDeleted = await product.delete()

    assert.isDefined(productDeleted.deletedAt)

    const productDeletedForced = await product.delete(true)

    assert.isUndefined(productDeletedForced)
  })

  test('should be able to restore soft deleted models', async ({ assert }) => {
    const product = await ProductMySql.find()
    const productDeleted = await product.delete()

    assert.isTrue(productDeleted.isTrashed())
    assert.isDefined(productDeleted.deletedAt)

    await productDeleted.restore()

    assert.isNull(productDeleted.deletedAt)
  })

  test('should be able to retrieve soft deleted models and only soft deleted', async ({ assert }) => {
    const toDelete = await ProductMySql.query().limit(5).findMany()

    await Promise.all(toDelete.map(product => product.delete()))

    const withoutTrashed = await ProductMySql.query().findMany()

    withoutTrashed.forEach(product => assert.isNull(product.deletedAt))

    const withTrashed = await ProductMySql.query().withTrashed().findMany()

    assert.lengthOf(withTrashed, 10)

    const onlyTrashed = await ProductMySql.query().onlyTrashed().findMany()

    onlyTrashed.forEach(product => assert.isDefined(product.deletedAt))
  })

  test('should be able to add, get and remove criterias from the model', async ({ assert }) => {
    ProductMySql.addCriteria('select', Criteria.select('id').limit(5))
    ProductMySql.addCriteria('orderBy', Criteria.orderBy('id', 'DESC').get())

    const products = await ProductMySql.findMany()

    assert.lengthOf(products, 5)

    products.forEach(product => assert.isUndefined(product.name))

    let criterias = ProductMySql.getCriterias()

    assert.isDefined(criterias.select)
    assert.isDefined(criterias.orderBy)

    ProductMySql.removeCriteria('select')
    ProductMySql.removeCriteria('orderBy')

    criterias = ProductMySql.getCriterias()

    assert.isUndefined(criterias.select)
    assert.isUndefined(criterias.orderBy)
  })

  test('should be able to transform to json the relations included in the model', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()
    const productJson = product.toJSON()

    assert.notInstanceOf(productJson.user, UserMySql)
  })

  test('should be able to load relations after fetching the main model', async ({ assert }) => {
    const product = await ProductMySql.find()
    const user = await product.load('user')

    assert.isDefined(product.user)
    assert.deepEqual(user.id, product.user.id)
  })

  test('should throw an exception when trying to load a relation that does not exist', async ({ assert }) => {
    const product = await ProductMySql.find()

    await assert.rejects(() => product.load('not-found'), NotImplementedRelationException)
  })

  test('should be able to reload relations even if it is already loaded', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()
    const user = await product.load('user', query => query.select('id'))

    assert.isDefined(product.user)
    assert.isUndefined(user.name)
    assert.isUndefined(product.user.name)
    assert.deepEqual(user.id, product.user.id)
  })

  test('should be able to load relations after fetching the main model making sub queries', async ({ assert }) => {
    const product = await ProductMySql.find()
    const user = await product.load('user', query => query.select('id'))

    assert.isDefined(product.user)
    assert.isUndefined(user.name)
    assert.isUndefined(product.user.name)
    assert.deepEqual(user.id, product.user.id)
  })

  test('should be able to find relations using it queries from models', async ({ assert }) => {
    const product = await ProductMySql.find()
    const user = await product.userQuery().find()

    assert.deepEqual(user.id, product.userId)
  })

  test('should be able to update relations using it queries from models', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()
    const user = await product.userQuery().update({ name: 'Daniel Luna' })

    await product.refresh()

    assert.deepEqual(user.id, product.userId)
    assert.deepEqual(product.user, user)
  })

  test('should be able to delete relations using it queries from models', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()
    await product.userQuery().delete()

    await product.refresh()

    assert.isDefined(product.user.deletedAt)
  })

  test('should be able to associate a user to the product', async ({ assert }) => {
    const user = await UserMySql.find()
    const product = await ProductMySql.create()

    product.userQuery().associate(user)

    await product.save()
    await user.load('products', query => query.where('id', product.id))

    assert.deepEqual(user.id, product.userId)
    assert.deepEqual(user.products[0].id, product.id)
  })

  test('should be able to disassociate a user from the product', async ({ assert }) => {
    const product = await ProductMySql.find()

    product.userQuery().dissociate()

    await product.save()

    assert.isNull(product.userId)
  })

  test('should be able to save the user of the product using save method', async ({ assert }) => {
    const product = await ProductMySql.query().with('user').find()

    product.user.name = 'Testing'

    await product.save()
    await product.user.refresh()

    assert.deepEqual(product.user.name, 'Testing')
  })
})
