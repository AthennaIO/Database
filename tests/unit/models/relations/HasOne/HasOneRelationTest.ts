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
import { Profile } from '#tests/fixtures/models/e2e/Profile'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class HasOneRelationTest {
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
    const user = await User.query().with('profile').find()

    assert.instanceOf(user, User)
    assert.instanceOf(user.profile, Profile)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const user = await User.query()
      .select('id')
      .with('profile', query => query.select('id', 'userId'))
      .find()

    assert.instanceOf(user, User)
    assert.instanceOf(user.profile, Profile)
    assert.deepEqual(user, {
      id: 1,
      profile: {
        id: 1,
        userId: 1
      }
    })
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindMany({ assert }: Context) {
    const users = await User.query().with('profile').findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[0].profile, Profile)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const users = await User.query()
      .select('id')
      .with('profile', query => query.select('id', 'userId'))
      .findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[0].profile, Profile)
    assert.deepEqual(users, [
      {
        id: 1,
        profile: {
          id: 1,
          userId: 1
        }
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveARelationInDatabaseWhenUsingFind({ assert }: Context) {
    await User.create({ id: 2, name: 'txsoura' })
    const user = await User.query().with('profile').where('id', 2).find()

    assert.instanceOf(user, User)
    assert.isUndefined(user.profile)
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveARelationInDatabaseWhenUsingFindMany({ assert }: Context) {
    await User.create({ id: 2, name: 'txsoura' })
    const users = await User.query().with('profile').orderBy('name').findMany()

    assert.instanceOf(users[0], User)
    assert.instanceOf(users[1], User)
    assert.instanceOf(users[0].profile, Profile)
    assert.isUndefined(users[1].profile)
  }
}
