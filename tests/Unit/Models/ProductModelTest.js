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
import { UserMySql } from '#tests/Stubs/models/UserMySql'
import { ProductMySql } from '#tests/Stubs/models/ProductMySql'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

test.group('ProductModelTest', group => {
  let userId = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await new DatabaseProvider().boot()

    await Database.connection('mysql').connect()
    await Database.connection('mysql').runMigrations()

    const [user] = await UserMySql.factory().count(10).create({ id: null })

    userId = user.id

    await ProductMySql.factory().count(10).create({ id: null, userId })
  })

  group.each.teardown(async () => {
    await Database.connection('mysql').revertMigrations()
    await Database.connection('mysql').close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
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

  test('should be able to find product and products', async ({ assert }) => {
    const product = await ProductMySql.find({ id: 1 })

    assert.deepEqual(product.id, 1)

    const products = await ProductMySql.query().addSelect('name').whereIn('id', [1, 2]).orderBy('id', 'DESC').findMany()

    assert.lengthOf(products, 2)
    assert.isDefined(products[0].name)
    assert.isDefined(products[1].name)
    assert.deepEqual(products[0].id, 2)
    assert.deepEqual(products[1].id, 1)

    const allProductMySqls = await ProductMySql.findMany({ id: 1 })

    assert.lengthOf(allProductMySqls, 1)
  })

  test('should be able to find products using query builder', async ({ assert }) => {
    await Database.connection('mysql').truncate('products')

    const createdAt = new Date(Date.now() - 100000)

    await ProductMySql.create({ name: 'iPhone 10', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 11 Pro', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iphone 12', userId, createdAt }, true)
    await ProductMySql.create({ name: 'iPhone 12 Pro', userId })

    const iphone12 = await ProductMySql.query().whereLike('name', 'iPhone 12').findMany()
    assert.lengthOf(iphone12, 3)

    const iphone12ILike = await ProductMySql.query().whereILike('name', 'iPhone 12').findMany()
    assert.lengthOf(iphone12ILike, 3)

    iphone12ILike.forEach(iphone => assert.isTrue(iphone.name.includes('12')))

    const allIphonesWithout10 = await ProductMySql.query().whereNot('name', 'iPhone 10').findMany()
    assert.lengthOf(allIphonesWithout10, 5)

    const allIphonesWithout11 = await ProductMySql.query().whereNotIn('name', ['iPhone 11', 'iPhone 11 Pro']).findMany()
    assert.lengthOf(allIphonesWithout11, 4)

    await ProductMySql.query().whereILike('name', 'iphone%').update({ deletedAt: new Date() }, true)

    const deletedIphones = await ProductMySql.query().whereNotNull('deletedAt').findMany()
    assert.lengthOf(deletedIphones, 0)

    // TODO Why length is 0?
    // const oldIphones = await ProductMySql.query()
    //   .removeCriteria('deletedAt')
    //   .whereBetween('createdAt', [createdAt, new Date()])
    //   .findMany()
    // assert.lengthOf(oldIphones, 5)
    //
    // const newIphones = await ProductMySql.query()
    //   .removeCriteria('deletedAt')
    //   .whereNotBetween('createdAt', [createdAt, new Date()])
    //   .findMany()
    // assert.lengthOf(newIphones, 1)
  })

  test('should be able to get paginate products', async ({ assert }) => {
    const { data, meta, links } = await ProductMySql.paginate(0, 10, '/', { id: 1 })

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

  test('should be able to update product and products', async ({ assert }) => {
    const { createdAt } = await ProductMySql.find({ id: 1 })

    const product = await ProductMySql.update({ id: 1 }, { name: 'iPhone X Updated', createdAt: new Date() })

    assert.deepEqual(product.createdAt, createdAt)
    assert.deepEqual(product.id, 1)
    assert.deepEqual(product.name, 'iPhone X Updated')

    const productDates = await ProductMySql.query().whereIn('id', [1, 2]).findMany()
    const products = await ProductMySql.query()
      .whereIn('id', [1, 2])
      .update({ name: 'iPhone X Updated', createdAt: new Date() })

    assert.deepEqual(products[0].createdAt, productDates[0].createdAt)
    assert.deepEqual(products[1].createdAt, productDates[1].createdAt)
    assert.lengthOf(products, 2)
    assert.deepEqual(products[0].id, 1)
    assert.deepEqual(products[0].name, 'iPhone X Updated')
    assert.deepEqual(products[1].id, 2)
    assert.deepEqual(products[1].name, 'iPhone X Updated')
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => ProductMySql.update({}), EmptyWhereException)
  })

  test('should be able to delete/softDelete product and products', async ({ assert }) => {
    await ProductMySql.delete({ id: 3 }, true)

    const notFoundProductMySql = await ProductMySql.find({ id: 3 })

    assert.isNull(notFoundProductMySql)

    await ProductMySql.query().whereIn('id', [1, 2]).delete()

    const products = await ProductMySql.query().removeCriteria('deletedAt').whereIn('id', [1, 2]).findMany()

    assert.lengthOf(products, 2)

    assert.deepEqual(products[0].id, 1)
    assert.isDefined(products[0].deletedAt)

    assert.deepEqual(products[1].id, 2)
    assert.isDefined(products[1].deletedAt)
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => ProductMySql.delete({}), EmptyWhereException)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    await ProductMySql.factory().count(5).create({ userId, deletedAt: new Date() })

    const products = await ProductMySql.query()
      .where('userId', userId)
      .includes('user')
      .whereNull('products.deletedAt')
      .select('user.id', 'user.name')
      .select('products.id', 'products.name', 'products.deletedAt')
      .orderBy('products.id', 'DESC')
      .findMany()

    products.forEach(product => {
      assert.deepEqual(product.user.id, userId)
      assert.deepEqual(product.deletedAt, null)
    })
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
