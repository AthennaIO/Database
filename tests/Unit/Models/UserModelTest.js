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
import { UserResource } from '#tests/Stubs/app/Resources/UserResource'
import { Product } from '#tests/Stubs/models/Product'
import { User } from '#tests/Stubs/models/User'

test.group('UserModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
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
    await Database.close()
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
    await Database.truncate('users')

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

    const users = await User.findMany()

    users[0].name = 'João Lenon Array Updated'
    users[0].createdAt = createdAt

    await users[0].save()

    assert.deepEqual(users[0].name, 'João Lenon Array Updated')
    assert.notEqual(users[0].createdAt, createdAt)
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

    const user = await User.query().where({ id: userId }).includes('products').find()

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
      .includes('products', query => query.select('id', 'name').whereNull('deletedAt').orderBy('id', 'DESC'))
      .find()

    assert.deepEqual(user.id, userId)
    assert.lengthOf(user.products, 5)
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

  test('should be able to get the user/users as resource', async ({ assert }) => {
    const users = await User.query().includes('products').findMany()

    const userResource = users[0].toResource()

    assert.notInstanceOf(userResource, User)

    assert.isUndefined(userResource.createdAt)
    assert.isUndefined(users.toResource({ role: 'admin' })[0].createdAt)
  })

  test('should be able to get the user/users as resource using resource class', async ({ assert }) => {
    const users = await User.query().includes('products').findMany()

    const userResource = UserResource.toJson(users[0])

    assert.notInstanceOf(userResource, User)

    assert.isUndefined(userResource.createdAt)
    assert.isUndefined(UserResource.toArray(users)[0].createdAt)
  })

  test('should throw a not implemented relation exception', async ({ assert }) => {
    assert.throws(() => User.query().includes('notImplemented'), NotImplementedRelationException)
  })
})
