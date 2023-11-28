/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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

    const pg = Database.connection('postgres-docker').connect()

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.runMigrations()

    // TODO Use model factories instead
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
    assert.deepEqual(user, {
      id: 1,
      products: [
        {
          id: 1,
          userId: 1
        }
      ]
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
    assert.deepEqual(users, [
      {
        id: 1,
        products: [
          {
            id: 1,
            userId: 1
          }
        ]
      }
    ])
  }
}
