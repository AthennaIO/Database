/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Connections } from '#src/types'
import { Database } from '#src/facades/Database'
import { BaseModel } from '#src/models/BaseModel'
import { User } from '#tests/fixtures/models/User'
import { Path, Collection } from '@athenna/common'
import { Profile } from '#tests/fixtures/models/Profile'
import { Product } from '#tests/fixtures/models/Product'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelFactory } from '#src/models/factories/ModelFactory'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class BaseModelTest {
  @BeforeEach()
  public async beforeEach() {
    new DatabaseProvider().register()
    await Config.loadAll(Path.fixtures('config'))
    Database.connection('fake')
  }

  @AfterEach()
  public afterEach() {
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
    BaseModel.setAttributes(true).uniqueValidation(true).nullableValidation(true)
  }

  @Test()
  public async shouldBeAbleToGetTheConnectionThatModelIsUsing({ assert }: Context) {
    Config.set('database.default', 'postgres')

    assert.deepEqual(BaseModel.connection(), 'postgres')
  }

  @Test()
  public async shouldBeAbleToSetAValueForConnectionUsingInheritance({ assert }: Context) {
    class User extends BaseModel {
      public static connection(): Connections {
        return 'mongo'
      }
    }

    assert.deepEqual(User.connection(), 'mongo')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTable({ assert }: Context) {
    assert.deepEqual(BaseModel.table(), 'base_models')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTableWhenUsingInheritance({ assert }: Context) {
    class User extends BaseModel {}

    assert.deepEqual(User.table(), 'users')
  }

  @Test()
  public async shouldBeAbleToGetModelAttributes({ assert }: Context) {
    assert.deepEqual(BaseModel.attributes(), {})
  }

  @Test()
  public async shouldBeAbleToGetModelDefinitions({ assert }: Context) {
    assert.deepEqual(await BaseModel.definition(), {})
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelSchemaFromModelClass({ assert }: Context) {
    assert.instanceOf(BaseModel.schema(), ModelSchema)
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelFactoryFromModelClass({ assert }: Context) {
    assert.instanceOf(BaseModel.factory(), ModelFactory)
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelQueryBuilderFromModelClass({ assert }: Context) {
    assert.instanceOf(BaseModel.query(), ModelQueryBuilder)
  }

  @Test()
  public async shouldGenerateTheInstanceDriverByConnectionForTheModelQueryBuilder({ assert }: Context) {
    Database.spy()

    assert.instanceOf(BaseModel.query(), ModelQueryBuilder)
    assert.calledWith(Database.connection, 'fake')
  }

  @Test()
  public async shouldBeAbleToDisableUniqueValidationInModel({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)

    await BaseModel.uniqueValidation(false).create()

    assert.notCalled(Database.driver.find)
  }

  @Test()
  public async shouldBeAbleToDisableNullableValidationInModel({ assert }: Context) {
    Mock.when(Database.driver, 'createMany').resolve(undefined)

    await BaseModel.nullableValidation(false).create()

    assert.calledOnce(Database.driver.createMany)
  }

  @Test()
  public async shouldBeAbleToTruncateModelTable({ assert }: Context) {
    Mock.when(Database.driver, 'truncate').resolve(undefined)

    await BaseModel.truncate()

    assert.calledWith(Database.driver.truncate, 'base_models')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const data = await User.find()

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })
    Mock.when(Database.driver, 'where').return(undefined)

    const data = await User.find({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.calledOnceWith(Database.driver.where, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindOrFailMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const data = await User.findOrFail()

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindOrFailMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })
    Mock.when(Database.driver, 'where').return(undefined)

    const data = await User.findOrFail({ id: '1' })

    assert.deepEqual(data.id, '1')
    assert.calledOnceWith(Database.driver.where, { id: '1' })
  }

  @Test()
  public async shouldThrowExceptionIfFindOrFailMethodCantFindAnyValue({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)

    await assert.rejects(() => User.findOrFail(), NotFoundDataException)
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindOrMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const data = await User.findOr({}, () => ({ id: '2' }))

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindOrMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'where').return(undefined)

    const data = await User.findOr({ id: '1' }, () => ({ id: '2' }))

    assert.deepEqual(data.id, '2')
    assert.calledOnceWith(Database.driver.where, { id: '1' })
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingFindManyMethod({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1' }])

    const data = await User.findMany()

    assert.deepEqual(data[0].id, '1')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingFindManyMethod({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1' }])

    const data = await User.findMany({ id: '1' })

    assert.deepEqual(data[0].id, '1')
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseUsingCollectionMethod({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1' }])

    const data = await User.collection()

    assert.instanceOf(data, Collection)
  }

  @Test()
  public async shouldBeAbleToFindValueInDatabaseWithWhereClauseUsingCollectionMethod({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1' }])

    const data = await User.collection({ id: '1' })

    assert.instanceOf(data, Collection)
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = await User.create()

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateMethodWithoutCleaningPersist({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = await User.create({}, false)

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToCreateManyValuesInDatabaseUsingCreateManyMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = await User.createMany([{ id: '1' }])

    assert.deepEqual(data[0].id, '1')
  }

  @Test()
  public async shouldBeAbleToCreateManyValuesInDatabaseUsingCreateManyMethodWithoutCleaningPersist({
    assert
  }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = await User.createMany([{ id: '1' }], false)

    assert.deepEqual(data[0].id, '1')
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateOrUpdateMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = (await User.createOrUpdate({ id: '1' }, { id: '1' })) as User

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToCreateValueInDatabaseUsingCreateOrUpdateMethodWithoutCleaningPersist({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    const data = (await User.createOrUpdate({ id: '1' }, { id: '1' }, false)) as User

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToUpdateValueInDatabaseUsingCreateOrUpdateMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })
    Mock.when(Database.driver, 'update').resolve({ id: '2' })

    const data = (await User.uniqueValidation(false).createOrUpdate({ id: '1' }, { id: '2' })) as User

    assert.deepEqual(data.id, '2')
  }

  @Test()
  public async shouldBeAbleToUpdateValueInDatabaseUsingUpdateMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    const data = (await User.update({ id: '1' }, { id: '1' })) as User

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToUpdateValueInDatabaseUsingUpdateMethodWithoutCleaningPersist({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    const data = (await User.update({ id: '1' }, { id: '1' }, false)) as User

    assert.deepEqual(data.id, '1')
  }

  @Test()
  public async shouldBeAbleToUpdateManyValuesInDatabaseUsingUpdateMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve([{ id: '1' }, { id: '2' }])

    const data = await User.update({ rate: 5 }, { id: '1' })

    assert.deepEqual(data[0].id, '1')
    assert.deepEqual(data[1].id, '2')
  }

  @Test()
  public async shouldBeAbleToSoftDeleteValueInDatabaseUsingDeleteMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    await User.delete({ id: '1' })

    assert.calledOnce(Database.driver.update)
  }

  @Test()
  public async shouldBeAbleToForceDeleteValueInDatabaseUsingDeleteMethod({ assert }: Context) {
    Mock.when(Database.driver, 'delete').resolve(undefined)

    await User.delete({ id: '1' }, true)

    assert.calledOnce(Database.driver.delete)
  }

  @Test()
  public async shouldBeAbleToGetModelAsJsonUsingToJSONMethod({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'

    const json = user.toJSON()

    assert.notInstanceOf(json, User)
    assert.deepEqual(json, { id: '1', name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToGetModelAsJsonAndAlsoObjectRelationsUsingToJSONMethod({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.profile = new Profile()
    user.profile.id = '1'

    const json = user.toJSON()

    assert.notInstanceOf(json, User)
    assert.notInstanceOf(json.profile, Profile)
    assert.deepEqual(json, { id: '1', name: 'lenon', profile: { id: '1' } })
  }

  @Test()
  public async shouldBeAbleToGetModelAsJsonAndAlsoArrayRelationsUsingToJSONMethod({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.products = [new Product()]
    user.products[0].id = '1'

    const json = user.toJSON()

    assert.notInstanceOf(json, User)
    assert.notInstanceOf(json.products[0], Product)
    assert.deepEqual(json, { id: '1', name: 'lenon', products: [{ id: '1' }] })
  }

  @Test()
  public async shouldBeAbleToValidateThatAModelHasNotBeenPersistedInDatabase({ assert }: Context) {
    const user = new User()

    assert.isFalse(user.isPersisted())
  }

  @Test()
  public async shouldBeAbleToValidateThatAModelHasBeenPersistedInDatabase({ assert }: Context) {
    const user = new User().setOriginal()

    assert.isTrue(user.isPersisted())
  }

  @Test()
  public async shouldBeAbleToValidateThatAModelIsDirty({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.createdAt = new Date()
    user.deletedAt = null
    user.score = 5

    user.setOriginal()

    user.id = '2'
    user.name = 'txsoura'

    assert.isTrue(user.isDirty())
  }

  @Test()
  public async shouldBeAbleToGetOnlyDirtyValuesOfModel({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.createdAt = new Date()
    user.deletedAt = null
    user.score = 5

    user.setOriginal()

    user.id = '2'
    user.name = 'txsoura'

    assert.deepEqual(user.dirty(), { id: '2', name: 'txsoura' })
  }

  @Test()
  public async shouldBeAbleToGetAllValuesAsDirtyWhenModelIsNotPersisted({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.name = 'lenon'

    assert.deepEqual(user.dirty(), { id: '1', name: 'lenon' })
  }

  @Test()
  public async shouldBeAbleToCreateModelFromScratchUsingSaveMethod({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', name: 'lenon' }])

    const user = new User()

    user.id = '1'
    user.name = 'lenon'

    await user.save()

    assert.calledWith(Database.driver.createMany, [
      Mock.match({ id: '1', name: 'lenon', metadata1: 'random-1', metadata2: 'random-2' })
    ])
    assert.containsSubset(user, {
      id: '1',
      name: 'lenon',
      metadata1: 'random-1',
      metadata2: 'random-2',
      deletedAt: null,
      original: { id: '1', name: 'lenon', metadata1: 'random-1', metadata2: 'random-2', deletedAt: null }
    })
  }

  @Test()
  public async shouldBeAbleToUpdateModelUsingSaveMethod({ assert }: Context) {
    Mock.when(Database.driver, 'where').return(undefined)
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '2', name: 'txsoura' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'

    user.setOriginal()

    user.id = '2'
    user.name = 'txsoura'

    await user.save()

    assert.calledWith(
      Database.driver.update,
      Mock.match({ id: '2', name: 'txsoura', metadata1: 'random-1', metadata2: 'random-2' })
    )
    assert.containsSubset(user, {
      id: '2',
      name: 'txsoura',
      metadata1: 'random-1',
      metadata2: 'random-2',
      deletedAt: null,
      original: { id: '2', name: 'txsoura', metadata1: 'random-1', metadata2: 'random-2', deletedAt: null }
    })
  }

  @Test()
  public async shouldUpdateValuesIfAttributesOrDefaultColumnValuesChangeTheModel({ assert }: Context) {
    Mock.when(Database.driver, 'where').return(undefined)
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'lenon' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'

    user.setOriginal()

    await user.save()

    assert.calledWith(Database.driver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.containsSubset(user, {
      id: '1',
      name: 'lenon',
      metadata1: 'random-1',
      metadata2: 'random-2',
      deletedAt: null,
      original: { id: '1', name: 'lenon', metadata1: 'random-1', metadata2: 'random-2', deletedAt: null }
    })
  }

  @Test()
  public async shouldNotUpdateOrCreateTheModelIfThereAreNoDirtyValues({ assert }: Context) {
    Mock.when(Database.driver, 'where').return(undefined)
    Mock.when(Database.driver, 'update').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve(undefined)

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.email = 'lenon@athenna.io'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    user.setOriginal()

    await user.save()

    assert.notCalled(Database.driver.update)
    assert.notCalled(Database.driver.createMany)
    assert.containsSubset(user, {
      id: '1',
      name: 'lenon',
      email: 'lenon@athenna.io',
      metadata1: 'random-1',
      metadata2: 'random-2',
      deletedAt: null,
      original: {
        id: '1',
        name: 'lenon',
        email: 'lenon@athenna.io',
        metadata1: 'random-1',
        metadata2: 'random-2',
        deletedAt: null
      }
    })
  }

  @Test()
  public async shouldBeAbleToGetAFreshModelInstance({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    const freshUser = await user.fresh()

    user.id = '2'

    assert.deepEqual(freshUser.id, '1')
  }

  @Test()
  public async shouldBeAbleToGetRefreshModelInstance({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '2' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    await user.refresh()

    assert.deepEqual(user.id, '2')
    assert.deepEqual(user.name, 'lenon')
  }

  @Test()
  public async shouldBeAbleToVerifyModelIsTrashed({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.deletedAt = new Date()

    assert.isTrue(user.isTrashed())
  }

  @Test()
  public async shouldBeAbleToVerifyModelIsNotTrashed({ assert }: Context) {
    const user = new User()

    user.id = '1'
    user.deletedAt = null

    assert.isFalse(user.isTrashed())
  }

  @Test()
  public async shouldBeAbleToDeleteAModelFromInstance({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    await user.delete()

    assert.isDefined(user.deletedAt)
    assert.calledOnce(Database.driver.update)
  }

  @Test()
  public async shouldBeAbleToForceDeleteAModelFromInstance({ assert }: Context) {
    Mock.when(Database.driver, 'delete').resolve(undefined)

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    await user.delete(true)

    assert.isNull(user.deletedAt)
    assert.calledOnce(Database.driver.delete)
  }

  @Test()
  public async shouldBeAbleToRestoreAModelThatWasSoftDeleted({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    const user = new User()

    user.id = '1'
    user.name = 'lenon'
    user.metadata1 = 'random-1'
    user.metadata2 = 'random-2'
    user.createdAt = new Date()
    user.updatedAt = new Date()
    user.deletedAt = null

    await user.delete()

    assert.isDefined(user.deletedAt)
    assert.calledOnce(Database.driver.update)

    await user.restore()

    assert.isNull(user.deletedAt)
    assert.calledTimes(Database.driver.update, 2)
  }

  @Test()
  public async shouldBeAbleToUseFakerProperty({ assert }: Context) {
    assert.isTrue(BaseModel.faker.internet.email().includes('@'))
  }
}
