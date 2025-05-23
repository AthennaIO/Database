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
import { Profile } from '#tests/fixtures/models/e2e/Profile'
import { Product } from '#tests/fixtures/models/e2e/Product'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class BelongsToRelationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new DatabaseProvider().register()

    ioc.transient('App/Models/User', User)
    ioc.transient('App/Models/Product', Product)
    ioc.transient('App/Models/Profile', Profile)

    const pg = Database.connection('postgres-docker')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.revertMigrations()
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
    const profile = await Profile.query().with('user').find()

    assert.instanceOf(profile, Profile)
    assert.instanceOf(profile.user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndWhereHas({ assert }: Context) {
    const profile = await Profile.query()
      .whereHas('user', query => query.where('id', 1))
      .find()

    assert.instanceOf(profile, Profile)
    assert.instanceOf(profile.user, User)
  }

  @Test()
  public async shouldBeAbleToNotLoadOneRelationUsingFindOneAndWhereHasIfRelationIsNotPresent({ assert }: Context) {
    const profile = await Profile.query()
      .whereHas('user', query => query.where('id', 99))
      .find()

    assert.isUndefined(profile)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const profile = await Profile.query()
      .select('id', 'userId')
      .with('user', query => query.select('id'))
      .find()

    assert.instanceOf(profile, Profile)
    assert.instanceOf(profile.user, User)
    assert.deepEqual(profile, {
      id: 1,
      userId: 1,
      user: { id: 1, original: { id: 1 } },
      original: { id: 1, userId: 1 }
    })
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindMany({ assert }: Context) {
    const profiles = await Profile.query().with('user').findMany()

    assert.instanceOf(profiles[0], Profile)
    assert.instanceOf(profiles[0].user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndWhereHas({ assert }: Context) {
    const profiles = await Profile.query()
      .whereHas('user', query => query.where('id', 1))
      .findMany()

    assert.instanceOf(profiles[0], Profile)
    assert.instanceOf(profiles[0].user, User)
  }

  @Test()
  public async shouldBeAbleToNotLoadOneRelationUsingFindManyAndWhereHasIfRelationIsNotPresent({ assert }: Context) {
    const profiles = await Profile.query()
      .whereHas('user', query => query.where('id', 99))
      .findMany()

    assert.isUndefined(profiles[0])
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const profiles = await Profile.query()
      .select('id', 'userId')
      .with('user', query => query.select('id'))
      .findMany()

    assert.instanceOf(profiles[0], Profile)
    assert.instanceOf(profiles[0].user, User)
    assert.deepEqual(profiles, [
      {
        id: 1,
        userId: 1,
        user: { id: 1, original: { id: 1 } },
        original: { id: 1, userId: 1 }
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindOne({ assert }: Context) {
    const product = await Product.query().with('user').find()

    assert.instanceOf(product, Product)
    assert.instanceOf(product.user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindOneAndWhereHas({ assert }: Context) {
    const product = await Product.query()
      .whereHas('user', query => query.where('id', 1))
      .find()

    assert.instanceOf(product, Product)
    assert.instanceOf(product.user, User)
  }

  @Test()
  public async shouldBeAbleToNotLoadOppositeHasManyRelationUsingFindOneAndWhereHasIfRelationIsNotPresent({
    assert
  }: Context) {
    const product = await Product.query()
      .whereHas('user', query => query.where('id', 99))
      .find()

    assert.isUndefined(product)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const product = await Product.query()
      .select('id', 'userId')
      .with('user', query => query.select('id'))
      .find()

    assert.instanceOf(product, Product)
    assert.instanceOf(product.user, User)
    assert.deepEqual(product, {
      id: 1,
      userId: 1,
      user: { id: 1, original: { id: 1 } },
      original: { id: 1, userId: 1 }
    })
  }

  @Test()
  public async shouldBeAbleToNotLoadOppositeHasManyRelationUsingFindOneAndAndWhereHasIfRelationIsNotPresent({
    assert
  }: Context) {
    const product = await Product.query()
      .whereHas('user', query => query.where('id', 99))
      .find()

    assert.isUndefined(product)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindMany({ assert }: Context) {
    const products = await Product.query().with('user').findMany()

    assert.instanceOf(products[0], Product)
    assert.instanceOf(products[0].user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindManyAndWhereHas({ assert }: Context) {
    const products = await Product.query()
      .whereHas('user', query => query.where('id', 1))
      .findMany()

    assert.instanceOf(products[0], Product)
    assert.instanceOf(products[0].user, User)
  }

  @Test()
  public async shouldBeAbleToNotLoadOppositeHasManyRelationUsingFindManyAndWhereHasIfRelationIsNotPresent({
    assert
  }: Context) {
    const products = await Product.query()
      .whereHas('user', query => query.where('id', 99))
      .findMany()

    assert.isUndefined(products[0])
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const products = await Product.query()
      .select('id', 'userId')
      .with('user', query => query.select('id'))
      .findMany()

    assert.instanceOf(products[0], Product)
    assert.instanceOf(products[0].user, User)
    assert.deepEqual(products, [
      {
        id: 1,
        userId: 1,
        user: { id: 1, original: { id: 1 } },
        original: { id: 1, userId: 1 }
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationFromInstance({ assert }: Context) {
    const profile = await Profile.query().find()

    await profile.load('user')

    assert.instanceOf(profile, Profile)
    assert.instanceOf(profile.user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationFromInstanceAndExecuteClosure({ assert }: Context) {
    const profile = await Profile.query().select('id', 'userId').find()

    await profile.load('user', query => query.select('id'))

    assert.instanceOf(profile, Profile)
    assert.instanceOf(profile.user, User)
    assert.deepEqual(profile, {
      id: 1,
      userId: 1,
      user: { id: 1, original: { id: 1 } },
      original: { id: 1, userId: 1 }
    })
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationFromInstance({ assert }: Context) {
    const product = await Product.query().find()

    await product.load('user')

    assert.instanceOf(product, Product)
    assert.instanceOf(product.user, User)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeHasManyRelationFromInstanceAndExecuteClosure({ assert }: Context) {
    const product = await Product.query().select('id', 'userId').find()

    await product.load('user', query => query.select('id'))

    assert.instanceOf(product, Product)
    assert.instanceOf(product.user, User)
    assert.deepEqual(product, {
      id: 1,
      userId: 1,
      user: { id: 1, original: { id: 1 } },
      original: { id: 1, userId: 1 }
    })
  }

  @Test()
  public async shouldBeAbleToLoadNestedBelongsToRelationUsingWithMethod({ assert }: Context) {
    const product = await Product.query().with('user.profile').find()

    assert.instanceOf(product.user, User)
    assert.instanceOf(product.user.profile, Profile)
  }

  @Test()
  public async shouldBeAbleToLoadNestedBelongsToRelationUsingLoadMethod({ assert }: Context) {
    const product = await Product.find()
    const profile = await product.load('user.profile')

    assert.instanceOf(product.user, User)
    assert.instanceOf(profile, Profile)
  }
}
