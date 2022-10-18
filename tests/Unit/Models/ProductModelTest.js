/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { test } from '@japa/runner'
import { Config, Folder, Path } from '@secjs/utils'

import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'
import { Database } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { ProductMySql } from '#tests/Stubs/models/ProductMySql'
import { UserMySql } from '#tests/Stubs/models/UserMySql'

test.group('ProductModelTest', group => {
  let userId = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
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

    const createdAt = new Date(Date.now() - 100000)

    await ProductMySql.create({ name: 'iPhone 10', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11 Pro', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iphone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12 Pro', userId, createdAt: Date.now() + 100000 })

    const iphone12 = await ProductMySql.query().whereLike('name', 'iPhone 12%').findMany()
    assert.lengthOf(iphone12, 3)

    const iphone12ILike = await ProductMySql.query().whereILike('name', 'iPhone 12%').findMany()
    assert.lengthOf(iphone12ILike, 3)

    iphone12ILike.forEach(iphone => assert.isTrue(iphone.name.includes('12')))

    const allIphonesWithout10 = await ProductMySql.query().whereNot('name', 'iPhone 10').findMany()
    assert.lengthOf(allIphonesWithout10, 5)

    const allIphonesWithout11 = await ProductMySql.query().whereNotIn('name', ['iPhone 11', 'iPhone 11 Pro']).findMany()
    assert.lengthOf(allIphonesWithout11, 4)

    const res = await ProductMySql.query()
      .whereILike('name', 'iphone%')
      .whereNot('name', 'iPhone 12 Pro')
      .update({ deletedAt: new Date() }, true)

    console.log(res)

    const deletedIphones = await ProductMySql.query().whereNotNull('deletedAt').findMany()
    assert.lengthOf(deletedIphones, 0)

    const createdAtOlder = new Date(createdAt.getTime() - 500)

    const oldIphones = await ProductMySql.query()
      .removeCriteria('deletedAt')
      .whereBetween('createdAt', [createdAtOlder, new Date()])
      .findMany()

    console.log('old iphones', oldIphones)

    assert.lengthOf(oldIphones, 5)

    const newIphones = await ProductMySql.query()
      .removeCriteria('deletedAt')
      .whereNotBetween('createdAt', [createdAtOlder, new Date()])
      .findMany()
    assert.lengthOf(newIphones, 1)
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

    const products = await ProductMySql.findMany()

    products[0].name = 'Macbook M3'
    products[0].createdAt = createdAt

    await products[0].save()

    assert.deepEqual(products[0].name, 'Macbook M3')
    assert.notEqual(products[0].createdAt, createdAt)
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
      .includes('user', query => query.select('id', 'name'))
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
    const [product] = await ProductMySql.query().includes('user').findMany()

    const productJson = product.toJSON()

    assert.notInstanceOf(productJson, ProductMySql)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => ProductMySql.query().includes('notImplemented'), NotImplementedRelationException)
  })
})
