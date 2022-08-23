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

test.group('UserModelTest', group => {
  /** @type {Database} */
  let database = null

  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    database = new Database()

    await database.connect()

    await database.createTable('users', {
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'name',
          type: 'varchar',
        },
        {
          name: 'email',
          isUnique: true,
          type: 'varchar',
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
          default: null,
        },
      ],
    })
    await database.createTable('products', {
      columns: [
        {
          name: 'id',
          type: 'int',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'name',
          type: 'varchar',
        },
        {
          name: 'userId',
          type: 'int',
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
          default: null,
        },
      ],
    })

    database.buildTable('users')

    await User.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await database.dropTable('users')
    await database.dropTable('products')
    await database.close()
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
  })

  test('should be able to get paginate users', async ({ assert }) => {
    const { data, meta, links } = await User.query().whereIn('id', [1, 2]).orderBy('id', 'DESC').paginate()

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

  test('should be able to add products to user', async ({ assert }) => {
    await Product.create({ name: 'iPhone X', userId: 1 })

    const user = await User.query().where({ id: 1 }).includes('products').find()

    assert.deepEqual(user.products[0].id, 1)
    assert.deepEqual(user.products[0].name, 'iPhone X')
  })
})
