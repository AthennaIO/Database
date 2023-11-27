/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import type { Connections } from '#src/types'
import { Database } from '#src/facades/Database'
import { User } from '#tests/fixtures/models/User'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'
import { Collection } from '@athenna/common'

export default class ModelTest {
  @BeforeEach()
  public async beforeEach() {
    new DatabaseProvider().register()
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToGetTheConnectionThatModelIsUsing({ assert }: Context) {
    Config.set('database.default', 'postgres')

    assert.deepEqual(Model.connection(), 'postgres')
  }

  @Test()
  public async shouldBeAbleToSetAValueForConnectionUsingInheritance({ assert }: Context) {
    class User extends Model {
      public static connection(): Connections {
        return 'mongo'
      }
    }

    assert.deepEqual(User.connection(), 'mongo')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTable({ assert }: Context) {
    assert.deepEqual(Model.table(), 'models')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTableWhenUsingInheritance({ assert }: Context) {
    class User extends Model {}

    assert.deepEqual(User.table(), 'users')
  }

  @Test()
  public async shouldBeAbleToGetModelAttributes({ assert }: Context) {
    assert.deepEqual(Model.attributes(), {})
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelSchemaFromModelClass({ assert }: Context) {
    assert.instanceOf(Model.schema(), ModelSchema)
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelQueryBuilderFromModelClass({ assert }: Context) {
    assert.instanceOf(Model.query(), ModelQueryBuilder)
  }

  @Test()
  public async shouldGenerateTheInstanceDriverByConnectionForTheModelQueryBuilder({ assert }: Context) {
    Config.set('database.default', 'mongo-memory')
    Database.spy()

    assert.instanceOf(Model.query(), ModelQueryBuilder)
    assert.calledWith(Database.connection, 'mongo-memory')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })

    const data = await User.find()

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })
    Mock.when(FakeDriver, 'where').return(undefined)

    const data = await User.find({ id: '1' })

    assert.deepEqual(data, { id: '1' })
    assert.calledOnceWith(FakeDriver.where, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindOrFailMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })

    const data = await User.findOrFail()

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindOrFailMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })
    Mock.when(FakeDriver, 'where').return(undefined)

    const data = await User.findOrFail({ id: '1' })

    assert.deepEqual(data, { id: '1' })
    assert.calledOnceWith(FakeDriver.where, { id: '1' })
  }

  @Test()
  public async shouldThrowExceptionIfFindOrFailMethodCantFindAnyValue({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve(undefined)

    await assert.rejects(() => User.findOrFail(), NotFoundDataException)
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindOrMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })

    const data = await User.findOr({}, () => ({ id: '2' }))

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindOrMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'where').return(undefined)

    const data = await User.findOr({ id: '1' }, () => ({ id: '2' }))

    assert.deepEqual(data, { id: '2' })
    assert.calledOnceWith(FakeDriver.where, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindManyMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'findMany').resolve([{ id: '1' }])

    const data = await User.findMany()

    assert.deepEqual(data, [{ id: '1' }])
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindManyMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'findMany').resolve([{ id: '1' }])

    const data = await User.findMany({ id: '1' })

    assert.deepEqual(data, [{ id: '1' }])
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingCollectionMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'findMany').resolve([{ id: '1' }])

    const data = await User.collection()

    assert.instanceOf(data, Collection)
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingCollectionMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'findMany').resolve([{ id: '1' }])

    const data = await User.collection({ id: '1' })

    assert.instanceOf(data, Collection)
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1' }])

    const data = await User.create({ id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToCreateManyValuesInDatabaseUsingCreateManyMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1' }])

    const data = await User.createMany([{ id: '1' }])

    assert.deepEqual(data, [{ id: '1' }])
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateOrUpdateMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1' }])

    const data = await User.createOrUpdate({ id: '1' }, { id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToUpdateValueInDatabaseUsingCreateOrUpdateMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1' })
    Mock.when(FakeDriver, 'update').resolve({ id: '2' })

    const data = await User.createOrUpdate({ id: '1' }, { id: '2' })

    assert.deepEqual(data, { id: '2' })
  }

  @Test()
  public async shouldBeAbleToUpdateValueInDatabaseUsingUpdateMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'update').resolve({ id: '1' })

    const data = await User.update({ id: '1' }, { id: '1' })

    assert.deepEqual(data, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToUpdateManyValuesInDatabaseUsingUpdateMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'update').resolve([{ id: '1' }, { id: '2' }])

    const data = await User.update({ rate: 5 }, { id: '1' })

    assert.deepEqual(data, [{ id: '1' }, { id: '2' }])
  }

  @Test()
  public async shouldBeAbleToSoftDeleteValueInDatabaseUsingDeleteMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'update').resolve({ id: '1' })

    await User.delete({ id: '1' })

    assert.calledOnce(FakeDriver.update)
  }

  @Test()
  public async shouldBeAbleToForceDeleteValueInDatabaseUsingDeleteMethod({ assert }: Context) {
    Mock.when(FakeDriver, 'delete').resolve(undefined)

    await User.delete({ id: '1' }, true)

    assert.calledOnce(FakeDriver.delete)
  }
}
