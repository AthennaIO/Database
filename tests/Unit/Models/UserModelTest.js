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
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

test.group('UserModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()

    await User.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
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

  test('should be able to find user and users', async ({ assert }) => {
    const user = await User.find({ id: 1 })

    assert.isUndefined(user.email)
    assert.deepEqual(user.id, 1)

    const users = await User.query().addSelect('email').whereIn('id', [1, 2]).orderBy('id', 'DESC').findMany()

    assert.lengthOf(users, 2)
    assert.isDefined(users[0].email)
    assert.isDefined(users[1].email)
    assert.deepEqual(users[0].id, 2)
    assert.deepEqual(users[1].id, 1)

    const allUsers = await User.findMany()

    assert.lengthOf(allUsers, 10)
  })

  test('should be able to find user using query builder', async ({ assert }) => {
    await Database.truncate('users')

    const createdAt = new Date(Date.now() - 100000)

    await User.factory().create({ name: 'João', createdAt })
    await User.factory().create({ name: 'joão lenon', createdAt })
    await User.factory().create({ name: 'Victor', createdAt })
    await User.factory().create({ name: 'victor tesoura' })

    assert.lengthOf(await User.query().whereLike('name', 'João').findMany(), 1)
    assert.lengthOf(await User.query().whereILike('name', 'João').findMany(), 2)
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
    const { createdAt } = await User.find({ id: 1 })

    const user = await User.update({ id: 1 }, { name: 'João Lenon Updated', createdAt: new Date() })

    assert.deepEqual(user.createdAt, createdAt)
    assert.deepEqual(user.id, 1)
    assert.deepEqual(user.name, 'João Lenon Updated')

    const usersDates = await User.query().whereIn('id', [1, 2]).findMany()
    const users = await User.query().whereIn('id', [1, 2]).update({ name: 'João Lenon Updated', createdAt: new Date() })

    assert.deepEqual(users[0].createdAt, usersDates[0].createdAt)
    assert.deepEqual(users[1].createdAt, usersDates[1].createdAt)
    assert.lengthOf(users, 2)
    assert.deepEqual(users[0].id, 1)
    assert.deepEqual(users[0].name, 'João Lenon Updated')
    assert.deepEqual(users[1].id, 2)
    assert.deepEqual(users[1].name, 'João Lenon Updated')
  })

  test('should throw a empty where exception on update without where', async ({ assert }) => {
    await assert.rejects(() => User.update({}), EmptyWhereException)
  })

  test('should be able to delete/softDelete user and users', async ({ assert }) => {
    await User.delete({ id: 3 }, true)

    const notFoundUser = await User.find({ id: 3 })

    assert.isNull(notFoundUser)

    await User.query().whereIn('id', [1, 2]).delete()

    const users = await User.query().removeCriteria('deletedAt').whereIn('id', [1, 2]).findMany()

    assert.lengthOf(users, 2)

    assert.deepEqual(users[0].id, 1)
    assert.isDefined(users[0].deletedAt)

    assert.deepEqual(users[1].id, 2)
    assert.isDefined(users[1].deletedAt)
  })

  test('should throw a empty where exception on delete without where', async ({ assert }) => {
    await assert.rejects(() => User.delete({}), EmptyWhereException)
  })

  test('should be able to add products to user', async ({ assert }) => {
    await Product.create({ name: 'iPhone X', userId: 1 })

    const user = await User.query().where({ id: 1 }).includes('products').find()

    assert.deepEqual(user.products[0].id, 1)
    assert.deepEqual(user.products[0].name, 'iPhone X')
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const userId = await User.factory('id').create()
    await Product.factory().count(5).create({ userId })
    await Product.factory().count(5).create({ userId, deletedAt: new Date() })

    const user = await User.query()
      .where('id', userId)
      .includes('products')
      .whereNull('products.deletedAt')
      .select('users.id', 'users.name')
      .select('products.id', 'products.name')
      .orderBy('products.id', 'DESC')
      .find()

    assert.deepEqual(user.id, userId)
    assert.lengthOf(user.products, 5)
    assert.deepEqual(user.products[0].id, 5)
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
    const [user] = await User.query().includes('products').findMany()

    const userJson = user.toJSON()

    assert.notInstanceOf(userJson, User)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => User.query().includes('notImplemented'), NotImplementedRelationException)
  })
})
