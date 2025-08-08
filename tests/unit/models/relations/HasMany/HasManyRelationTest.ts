/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { User } from '#tests/fixtures/models/e2e/User'
import { Product } from '#tests/fixtures/models/e2e/Product'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class HasManyRelationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    new DatabaseProvider().register()

    const pg = Database.connection('postgres-docker')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.runMigrations()

    await pg.table('users').create({ id: 1, name: 'lenon', email: 'lenonsec7@gmail.com' })
    await pg.table('profiles').create({ id: 1, userId: 1 })
    await pg.table('products').create({ id: 1, userId: 1 })
  }

  @AfterEach()
  public async afterEach() {
    const pg = Database.connection('postgres-docker')

    await pg.revertMigrations()

    await Database.closeAll()
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOne({ assert }: Context) {
    const user = await User.query().with('products').find()

    assert.instanceOf(user, User)
    assert.instanceOf(user.products[0], Product)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const user = await User.query()
      .select('id')
      .with('products', query => query.select('id', 'userId'))
      .find()

    assert.instanceOf(user, User)
    assert.instanceOf(user.products[0], Product)
    assert.containSubset(user, {
      id: 1,
      products: [{ id: 1 }]
    })
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindMany({ assert }: Context) {
    const users = await User.query().with('products').findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[0].products[0], Product)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const users = await User.query()
      .select('id')
      .with('products', query => query.select('id', 'userId'))
      .findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[0].products[0], Product)
    assert.containSubset(users, [
      {
        id: 1,
        products: [{ id: 1, userId: 1 }]
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveARelationInDatabaseWhenUsingFind({ assert }: Context) {
    await User.create({ id: 2, name: 'txsoura' })
    const user = await User.query().with('products').where('id', 2).find()

    assert.instanceOf(user, User)
    assert.isEmpty(user.products)
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveARelationInDatabaseWhenUsingFindMany({ assert }: Context) {
    await User.create({ id: 2, name: 'txsoura' })
    const users = await User.query().with('products').orderBy('name').findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[1], User)
    assert.instanceOf(users[0].products[0], Product)
    assert.isEmpty(users[1].products)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationFromInstance({ assert }: Context) {
    const user = await User.query().find()

    await user.load('products')

    assert.instanceOf(user, User)
    assert.instanceOf(user.products[0], Product)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationFromInstanceAndExecuteClosure({ assert }: Context) {
    const user = await User.query().select('id').find()

    await user.load('products', query => query.select('id', 'userId'))

    assert.instanceOf(user, User)
    assert.instanceOf(user.products[0], Product)
    assert.containSubset(user, {
      id: 1,
      products: [{ id: 1, userId: 1 }]
    })
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveARelationInDatabaseFromInstance({ assert }: Context) {
    await User.create({ id: 2, name: 'txsoura' })
    const user = await User.query().where('id', 2).find()

    await user.load('products')

    assert.instanceOf(user, User)
    assert.isEmpty(user.products)
  }
}
