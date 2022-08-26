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
import { User } from '#tests/Stubs/models/User'
import { Product } from '#tests/Stubs/models/Product'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('ProductModelTest', group => {
  let userId = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    const [user] = await User.factory().count(10).create()

    userId = user.id

    await Product.factory().count(10).create({ userId })
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should be able to create product and products', async ({ assert }) => {
    const product = await Product.create({
      name: 'iPhone X',
      userId,
    })

    assert.isDefined(product.createdAt)
    assert.isDefined(product.updatedAt)
    assert.isNull(product.deletedAt)

    const products = await Product.createMany([
      { name: 'iPhone X', userId },
      { name: 'iPhone X', userId },
    ])

    assert.lengthOf(products, 2)
  })

  test('should be able to find product and products', async ({ assert }) => {
    const product = await Product.find({ id: 1 })

    assert.deepEqual(product.id, 1)

    const products = await Product.query().addSelect('name').whereIn('id', [1, 2]).orderBy('id', 'DESC').findMany()

    assert.lengthOf(products, 2)
    assert.isDefined(products[0].name)
    assert.isDefined(products[1].name)
    assert.deepEqual(products[0].id, 2)
    assert.deepEqual(products[1].id, 1)
  })

  test('should be able to find products using query builder', async ({ assert }) => {
    await Database.truncate('products')

    const createdAt = new Date(Date.now() - 100000)

    await Product.create({ name: 'iPhone 10', userId, createdAt }, true)
    await Product.create({ name: 'iPhone 11', userId, createdAt }, true)
    await Product.create({ name: 'iPhone 11 Pro', userId, createdAt }, true)
    await Product.create({ name: 'iPhone 12', userId, createdAt }, true)
    await Product.create({ name: 'iphone 12', userId, createdAt }, true)
    await Product.create({ name: 'iPhone 12 Pro', userId })

    const iphone12 = await Product.query().whereLike('name', 'iPhone 12').findMany()
    assert.lengthOf(iphone12, 2)

    const iphone12ILike = await Product.query().whereILike('name', 'iPhone 12').findMany()
    assert.lengthOf(iphone12ILike, 3)

    iphone12ILike.forEach(iphone => assert.isTrue(iphone.name.includes('12')))

    const allIphonesWithout10 = await Product.query().whereNot('name', 'iPhone 10').findMany()
    assert.lengthOf(allIphonesWithout10, 5)

    const allIphonesWithout11 = await Product.query().whereNotIn('name', ['iPhone 11', 'iPhone 11 Pro']).findMany()
    assert.lengthOf(allIphonesWithout11, 4)

    await Product.query().whereILike('name', 'iphone%').update({ deletedAt: new Date() }, true)

    const deletedIphones = await Product.query().whereNotNull('deletedAt').findMany()
    assert.lengthOf(deletedIphones, 0)

    const oldIphones = await Product.query()
      .removeCriteria('deletedAt')
      .whereBetween('createdAt', [createdAt, new Date()])
      .findMany()
    assert.lengthOf(oldIphones, 5)

    const newIphones = await Product.query()
      .removeCriteria('deletedAt')
      .whereNotBetween('createdAt', [createdAt, new Date()])
      .findMany()
    assert.lengthOf(newIphones, 1)
  })

  test('should be able to get paginate products', async ({ assert }) => {
    const { data, meta, links } = await Product.query().whereIn('id', [1, 2]).orderBy('id', 'DESC').paginate()

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

  test('should be able to update product and products', async ({ assert }) => {
    const { createdAt } = await Product.find({ id: 1 })

    const product = await Product.update({ id: 1 }, { name: 'iPhone X Updated', createdAt: new Date() })

    assert.deepEqual(product.createdAt, createdAt)
    assert.deepEqual(product.id, 1)
    assert.deepEqual(product.name, 'iPhone X Updated')

    const productDates = await Product.query().whereIn('id', [1, 2]).findMany()
    const products = await Product.query()
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

  test('should be able to delete/softDelete product and products', async ({ assert }) => {
    await Product.delete({ id: 3 }, true)

    const notFoundProduct = await Product.find({ id: 3 })

    assert.isNull(notFoundProduct)

    await Product.query().whereIn('id', [1, 2]).delete()

    const products = await Product.query().removeCriteria('deletedAt').whereIn('id', [1, 2]).findMany()

    assert.lengthOf(products, 2)

    assert.deepEqual(products[0].id, 1)
    assert.isDefined(products[0].deletedAt)

    assert.deepEqual(products[1].id, 2)
    assert.isDefined(products[1].deletedAt)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    await Product.factory().count(5).create({ userId, deletedAt: new Date() })

    const products = await Product.query()
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
    await Product.factory().count(5).create({ userId, deletedAt: new Date() })

    await User.assertExists({ id: userId })
    await Product.assertCount(10)
    await Product.assertSoftDelete({ userId })
  })
})
