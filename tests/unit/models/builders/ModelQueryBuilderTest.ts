/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Database } from '#src/facades/Database'
import { Collection, Path } from '@athenna/common'
import { User } from '#tests/fixtures/models/User'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { UserNotSoftDelete } from '#tests/fixtures/models/UserNotSoftDelete'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, Mock, AfterEach, type Context, BeforeEach } from '@athenna/test'

export default class ModelQueryBuilderTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    new DatabaseProvider().register()
    Database.when('connection').return({ driver: FakeDriver })
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    Config.clear()
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToGetTheDriverClientOfTheModelQueryBuilder({ assert }: Context) {
    const queryBuilder = User.query()
    const result = await queryBuilder.getClient()

    assert.deepEqual(FakeDriver.getClient(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheDriverModelQueryBuilderOfTheModelQueryBuilder({ assert }: Context) {
    const queryBuilder = User.query()
    const result = await queryBuilder.getQueryBuilder()

    assert.deepEqual(FakeDriver.getQueryBuilder(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(FakeDriver, 'avg').resolve(fakeAvg)

    const queryBuilder = User.query()
    const result = await queryBuilder.avg('score')

    assert.calledWith(FakeDriver.avg, 'score')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(FakeDriver, 'avgDistinct').resolve(fakeAvg)

    const queryBuilder = User.query()
    const result = await queryBuilder.avgDistinct('score')

    assert.calledWith(FakeDriver.avgDistinct, 'score')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(FakeDriver, 'avg').resolve(fakeAvg)

    const queryBuilder = User.query()
    const result = await queryBuilder.avg('rate')

    assert.calledWith(FakeDriver.avg, 'rate_number')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(FakeDriver, 'avgDistinct').resolve(fakeAvg)

    const queryBuilder = User.query()
    const result = await queryBuilder.avgDistinct('rate')

    assert.calledWith(FakeDriver.avgDistinct, 'rate_number')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumn({ assert }: Context) {
    const fakeMax = '200'
    Mock.when(FakeDriver, 'max').resolve(fakeMax)

    const queryBuilder = User.query()
    const result = await queryBuilder.max('score')

    assert.calledWith(FakeDriver.max, 'score')
    assert.equal(result, fakeMax)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumn({ assert }: Context) {
    const fakeMin = '10'
    Mock.when(FakeDriver, 'min').resolve(fakeMin)

    const queryBuilder = User.query()
    const result = await queryBuilder.min('score')

    assert.calledWith(FakeDriver.min, 'score')
    assert.equal(result, fakeMin)
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeMax = '200'
    Mock.when(FakeDriver, 'max').resolve(fakeMax)

    const queryBuilder = User.query()
    const result = await queryBuilder.max('rate')

    assert.calledWith(FakeDriver.max, 'rate_number')
    assert.equal(result, fakeMax)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeMin = '10'
    Mock.when(FakeDriver, 'min').resolve(fakeMin)

    const queryBuilder = User.query()
    const result = await queryBuilder.min('rate')

    assert.calledWith(FakeDriver.min, 'rate_number')
    assert.equal(result, fakeMin)
  }

  @Test()
  public async shouldBeAbleToSumAllNumbersOfAGivenColumn({ assert }: Context) {
    const fakeSum = '1000'
    Mock.when(FakeDriver, 'sum').resolve(fakeSum)

    const queryBuilder = User.query()
    const result = await queryBuilder.sum('score')

    assert.calledWith(FakeDriver.sum, 'score')
    assert.equal(result, fakeSum)
  }

  @Test()
  public async shouldBeAbleToSumDistinctValuesOfAGivenColumn({ assert }: Context) {
    const fakeSumDistinct = '900'
    Mock.when(FakeDriver, 'sumDistinct').resolve(fakeSumDistinct)

    const queryBuilder = User.query()
    const result = await queryBuilder.sumDistinct('score')

    assert.calledWith(FakeDriver.sumDistinct, 'score')
    assert.equal(result, fakeSumDistinct)
  }

  @Test()
  public async shouldBeAbleToSumAllNumbersOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeSum = '1000'
    Mock.when(FakeDriver, 'sum').resolve(fakeSum)

    const queryBuilder = User.query()
    const result = await queryBuilder.sum('rate')

    assert.calledWith(FakeDriver.sum, 'rate_number')
    assert.equal(result, fakeSum)
  }

  @Test()
  public async shouldBeAbleToSumDistinctValuesOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeSumDistinct = '900'
    Mock.when(FakeDriver, 'sumDistinct').resolve(fakeSumDistinct)

    const queryBuilder = User.query()
    const result = await queryBuilder.sumDistinct('rate')

    assert.calledWith(FakeDriver.sumDistinct, 'rate_number')
    assert.equal(result, fakeSumDistinct)
  }

  @Test()
  public async shouldBeAbleToIncrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'increment').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.increment('score')

    assert.calledOnce(FakeDriver.increment)
    assert.calledWith(FakeDriver.increment, 'score')
  }

  @Test()
  public async shouldBeAbleToDecrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'decrement').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.decrement('score')

    assert.calledOnce(FakeDriver.decrement)
    assert.calledWith(FakeDriver.decrement, 'score')
  }

  @Test()
  public async shouldBeAbleToIncrementAValueOfAGivenColumnParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'increment').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.increment('rate')

    assert.calledOnce(FakeDriver.increment)
    assert.calledWith(FakeDriver.increment, 'rate_number')
  }

  @Test()
  public async shouldBeAbleToDecrementAValueOfAGivenColumnParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'decrement').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.decrement('rate')

    assert.calledOnce(FakeDriver.decrement)
    assert.calledWith(FakeDriver.decrement, 'rate_number')
  }

  @Test()
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(FakeDriver, 'count').resolve(fakeCount)

    const queryBuilder = User.query()
    const result = await queryBuilder.count()

    assert.calledOnce(FakeDriver.count)
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountRecordsByColumnName({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(FakeDriver, 'count').resolve(fakeCount)

    const queryBuilder = User.query()
    const result = await queryBuilder.count('id')

    assert.calledOnceWith(FakeDriver.count, 'id')
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountRecordsByColumnNameParsingColumnName({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(FakeDriver, 'count').resolve(fakeCount)

    const queryBuilder = User.query()
    const result = await queryBuilder.count('rate')

    assert.calledOnceWith(FakeDriver.count, 'rate_number')
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecords({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(FakeDriver, 'countDistinct').resolve(fakeCountDistinct)

    const queryBuilder = User.query()
    const result = await queryBuilder.countDistinct('id')

    assert.calledOnce(FakeDriver.countDistinct)
    assert.calledWith(FakeDriver.countDistinct, 'id')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecordsParsingColumnName({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(FakeDriver, 'countDistinct').resolve(fakeCountDistinct)

    const queryBuilder = User.query()
    const result = await queryBuilder.countDistinct('rate')

    assert.calledOnceWith(FakeDriver.countDistinct, 'rate_number')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1', name: 'John Doe' })

    const queryBuilder = User.query()
    const result = await queryBuilder.findOrFail()

    assert.calledOnce(FakeDriver.find)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldThrownNotFoundDataExceptionWhenFindOrFailReturnsUndefined({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve(undefined)

    const queryBuilder = User.query()

    await assert.rejects(() => queryBuilder.findOrFail(), NotFoundDataException)
    assert.calledOnce(FakeDriver.find)
  }

  @Test()
  public async shouldBeAbleToFindDataOrExecuteTheCallback({ assert }: Context) {
    const callback = async () => null
    Mock.when(FakeDriver, 'find').resolve({ id: '1', name: 'John Doe' })

    const queryBuilder = User.query()
    await queryBuilder.findOr(callback)

    assert.calledOnce(FakeDriver.find)
  }

  @Test()
  public async shouldReturnClosureDataWhenDataIsUndefined({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    const callback = async () => expectedData
    Mock.when(FakeDriver, 'find').resolve(undefined)

    const queryBuilder = User.query()
    const result = await queryBuilder.findOr(callback)

    assert.deepEqual(result, expectedData)
    assert.calledOnce(FakeDriver.find)
  }

  @Test()
  public async shouldBeAbleToFindData({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1', name: 'John Doe' })

    const queryBuilder = User.query()
    const result = await queryBuilder.find()

    assert.calledOnce(FakeDriver.find)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToFindManyData({ assert }: Context) {
    Mock.when(FakeDriver, 'findMany').resolve([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ])

    const queryBuilder = User.query()
    const result = await queryBuilder.findMany()

    assert.calledOnce(FakeDriver.findMany)
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToFindManyDataUsingCollection({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(FakeDriver, 'findMany').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.collection()

    assert.calledOnce(FakeDriver.findMany)
    assert.instanceOf(result, Collection)
  }

  @Test()
  public async shouldBeAbleToCreateData({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '3', ...dataToCreate }])

    const queryBuilder = User.query()
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match(dataToCreate)])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '3', ...dataToCreate }])

    const queryBuilder = User.query()
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match(dataToCreate)])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1', rate: 1 }])

    const queryBuilder = User.query()
    const result = await queryBuilder.create({ rate: 1 })

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ rate_number: 1 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldNotBeAbleToPersistColumnsWithPersistDisabledWhenUsingCreate({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1' }])

    const queryBuilder = User.query()
    await queryBuilder.create({ score: 200 })

    assert.notCalledWith(FakeDriver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateMethod({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(FakeDriver, 'createMany').resolve([createdData])

    const queryBuilder = User.query()
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ ...dataToCreate, metadata1: 'random-1' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateMethodEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(FakeDriver, 'createMany').resolve([createdData])

    const queryBuilder = User.query()
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [
      Mock.match({ ...dataToCreate, metadata1: 'random-1', metadata2: 'random-2' })
    ])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateManyData({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    Mock.when(FakeDriver, 'createMany').resolve([
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ])

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match(dataToCreate[0]), Mock.match(dataToCreate[1])])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateManyDataParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1', rate: 1 }])

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany([{ rate: 1 }])

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ rate_number: 1 })])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateManyDataAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(FakeDriver, 'createMany').resolve([createdData])

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [
      Mock.match({ ...dataToCreate[0], deletedAt: null }),
      Mock.match({ ...dataToCreate[1], deletedAt: null })
    ])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldNotBeAbleToPersistColumnsWithPersistDisabledWhenUsingCreateMany({ assert }: Context) {
    Mock.when(FakeDriver, 'createMany').resolve([{ id: '1' }])

    const queryBuilder = User.query()
    await queryBuilder.createMany([{ score: 200 }])

    assert.notCalledWith(FakeDriver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateManyMethod({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(FakeDriver, 'createMany').resolve([createdData])

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [
      Mock.match({ ...dataToCreate[0], metadata1: 'random-1' }),
      Mock.match({ ...dataToCreate[1], metadata1: 'random-1' })
    ])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateManyMethodEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(FakeDriver, 'createMany').resolve([createdData])

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, [
      Mock.match({ ...dataToCreate[0], metadata1: 'random-1', metadata2: 'random-2' }),
      Mock.match({ ...dataToCreate[1], metadata1: 'random-1', metadata2: 'random-2' })
    ])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObject({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ name: 'Updated User' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ name: 'Updated User', deletedAt: null })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObjectParsingColumnNames({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', rate_number: 1 }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate({ id: '1', name: 'Updated User', rate: 1 })

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ name: 'Updated User', rate_number: 1 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObjectAndIgnoringPersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.notCalledWith(FakeDriver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToCreateData({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ metadata1: 'random-1' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToCreateDataEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(undefined)
    Mock.when(FakeDriver, 'createMany').resolve([dataToCreateOrUpdate])

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.createMany, [Mock.match({ metadata1: 'random-1', metadata2: 'random-2' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdate({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(FakeDriver, 'update').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'find').resolve({ id: '1', name: 'Updated User', rate: 1 })
    Mock.when(FakeDriver, 'update').resolve({ id: '1', name: 'Updated User', rate: 1 })

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate({ name: 'Updated User', rate: 1 })

    assert.calledOnceWith(FakeDriver.update, Mock.match({ name: 'Updated User', rate_number: 1 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(FakeDriver, 'update').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateAndIgnorePersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(FakeDriver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(FakeDriver, 'update').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.notCalledWith(FakeDriver.update, Mock.match({ score: 200 }))
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToUpdateData({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(FakeDriver, 'update').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToUpdateDataEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(FakeDriver, 'update').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateData({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(FakeDriver, 'update').resolve({ id: '1', ...dataToUpdate })

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataAndUpdateUpdatedAtColumn({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(FakeDriver, 'update').resolve({ id: '1', ...dataToUpdate })

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.notCalledWith(FakeDriver.update, dataToUpdate)
    assert.calledOnceWith(FakeDriver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataAndParseColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', rate: 1 }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ rate_number: 1 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataIgnoringPersistColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', score: 200 }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    await queryBuilder.update(dataToUpdate)

    assert.notCalledWith(FakeDriver.update, Mock.match({ score: 200 }))
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethod({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethodEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleData({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(FakeDriver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataAndParseColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', rate: 1 }
    Mock.when(FakeDriver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ rate_number: 1 }))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataAndUpdateUpdatedAtColumn({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(FakeDriver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.notCalledWith(FakeDriver.update, dataToUpdate)
    assert.calledOnceWith(FakeDriver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataIgnoringPersistColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', score: 200 }
    Mock.when(FakeDriver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const queryBuilder = User.query()
    await queryBuilder.update(dataToUpdate)

    assert.notCalledWith(FakeDriver.update, Mock.match({ score: 200 }))
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethodToUpdateMany({
    assert
  }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = [
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ]
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1' }))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethodToUpdateManyEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = [
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ]
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToSoftDeleteData({ assert }: Context) {
    Mock.when(FakeDriver, 'delete').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.delete()

    assert.notCalled(FakeDriver.delete)
  }

  @Test()
  public async shouldAutomaticallySetWhereNullDeletedAtClauseWhenIsDeleteDateColumnOptionIsTrue({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNull').return(undefined)

    User.query()

    assert.calledOnceWith(FakeDriver.whereNull, 'deletedAt')
  }

  @Test()
  public async shouldNotSetWhereNullDeletedAtClauseWhenModelDontHaveColumnWithIsDeleteDateColumnOptionAsTrue({
    assert
  }: Context) {
    Mock.when(FakeDriver, 'whereNull').return(undefined)

    UserNotSoftDelete.query()

    assert.notCalled(FakeDriver.whereNull)
  }

  @Test()
  public async shouldBeAbleToForceDeleteDataWhenUsingSoftDelete({ assert }: Context) {
    Mock.when(FakeDriver, 'delete').resolve(undefined)

    const queryBuilder = User.query()
    await queryBuilder.delete(true)

    assert.calledOnce(FakeDriver.delete)
  }

  @Test()
  public async shouldDeleteDataIfThereIsNotDeleteDateColumnPresentInModel({ assert }: Context) {
    Mock.when(FakeDriver, 'delete').resolve(undefined)

    const queryBuilder = UserNotSoftDelete.query()
    await queryBuilder.delete()

    assert.calledOnce(FakeDriver.delete)
  }

  @Test()
  public async shouldBeAbleToPerformARawQuery({ assert }: Context) {
    const sqlQuery = 'SELECT * FROM users WHERE id = ?'
    const bindings = [1]
    const expectedResult = [{ id: '1', name: 'John Doe' }]
    Mock.when(FakeDriver, 'raw').resolve(expectedResult)

    const queryBuilder = User.query()
    const result = await queryBuilder.raw(sqlQuery, bindings)

    assert.calledOnceWith(FakeDriver.raw, sqlQuery, bindings)
    assert.deepEqual(result, expectedResult)
  }

  @Test()
  public async shouldBeAbleToChangeTheTableOfTheModelQueryBuilder({ assert }: Context) {
    Mock.when(FakeDriver, 'table').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.table('profiles')

    assert.calledWith(FakeDriver.table, 'profiles')
  }

  @Test()
  public async shouldExecuteTheGivenClosureWhenCriteriaIsTrue({ assert }: Context) {
    let called = false
    const queryBuilder = User.query()
    queryBuilder.when(true, () => {
      called = true
    })

    assert.isTrue(called)
  }

  @Test()
  public async shouldNotExecuteTheGivenClosureWhenCriteriaIsNotTrue({ assert }: Context) {
    let called = false
    const queryBuilder = User.query()
    queryBuilder.when(false, () => {
      called = true
    })

    assert.isFalse(called)
  }

  @Test()
  public async shouldBeAbleToDumpTheQueryCrafted({ assert }: Context) {
    Mock.when(FakeDriver, 'dump').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.dump()

    assert.calledOnce(FakeDriver.dump)
  }

  @Test()
  public async shouldPaginateResultsAndReturnMetaDataForGivenPageAndLimit({ assert }: Context) {
    const page = 1
    const limit = 10
    const resourceUrl = '/users'
    const paginatedResult = { data: [], meta: { total: 0, perPage: limit, currentPage: page } }
    Mock.when(FakeDriver, 'paginate').resolve(paginatedResult)

    const queryBuilder = User.query()
    const result = await queryBuilder.paginate(page, limit, resourceUrl)

    assert.calledOnceWith(FakeDriver.paginate, page, limit, resourceUrl)
    assert.deepEqual(result, paginatedResult)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTable({ assert }: Context) {
    const columns: any[] = ['id', 'name']
    Mock.when(FakeDriver, 'select').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select(...columns)

    assert.calledOnceWith(FakeDriver.select, ...columns)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'select').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select('id', 'name', 'rate')

    assert.calledOnceWith(FakeDriver.select, 'id', 'name', 'rate_number')
  }

  @Test()
  public async shouldAllowRawSqlSelectionForSpecializedQueries({ assert }: Context) {
    const sql = 'COUNT(*) as userCount'
    Mock.when(FakeDriver, 'selectRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.selectRaw(sql)

    assert.calledOnceWith(FakeDriver.selectRaw, sql)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableUsingFrom({ assert }: Context) {
    const columns: any[] = ['id', 'name']
    Mock.when(FakeDriver, 'select').resolve(undefined)
    Mock.when(FakeDriver, 'from').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select(...columns).from('users')

    assert.calledOnceWith(FakeDriver.select, ...columns)
    assert.calledOnceWith(FakeDriver.from, 'users')
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableUsingFromParsingNames({ assert }: Context) {
    Mock.when(FakeDriver, 'select').resolve(undefined)
    Mock.when(FakeDriver, 'from').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select('id', 'name', 'rate').from('users')

    assert.calledOnceWith(FakeDriver.select, 'id', 'name', 'rate_number')
    assert.calledOnceWith(FakeDriver.from, 'users')
  }

  @Test()
  public async shouldAllowRawSqlSelectionForSpecializedQueriesUsingFromRaw({ assert }: Context) {
    const sql = 'COUNT(*) as userCount'
    Mock.when(FakeDriver, 'selectRaw').resolve(undefined)
    Mock.when(FakeDriver, 'fromRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.selectRaw(sql).fromRaw('users')

    assert.calledOnceWith(FakeDriver.selectRaw, sql)
    assert.calledOnceWith(FakeDriver.fromRaw, 'users')
  }

  @Test()
  public async shouldJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    const tableName = 'posts'
    const column1 = 'users.id'
    const operation = '='
    const column2 = 'posts.user_id'
    Mock.when(FakeDriver, 'join').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.join(tableName, column1, operation, column2)

    assert.calledOnceWith(FakeDriver.join, tableName, column1, operation, column2)
  }

  @Test()
  public async shouldApplyLeftJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'leftJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.leftJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.leftJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyRightJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'rightJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.rightJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.rightJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyCrossJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'crossJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.crossJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.crossJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyFullOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'fullOuterJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.fullOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.fullOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyLeftOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'leftOuterJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.leftOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.leftOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyRightOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(FakeDriver, 'rightOuterJoin').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.rightOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(FakeDriver.rightOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyJoinRawForGivenTableAndConditions({ assert }: Context) {
    const sql = 'NATURAL FULL JOIN users'
    Mock.when(FakeDriver, 'joinRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.joinRaw(sql)

    assert.calledOnceWith(FakeDriver.joinRaw, sql)
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumns({ assert }: Context) {
    const columns: any[] = ['account_id']
    Mock.when(FakeDriver, 'groupBy').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.groupBy(...columns)

    assert.calledOnceWith(FakeDriver.groupBy, ...columns)
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumnsParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'groupBy').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.groupBy('id', 'name', 'rate')

    assert.calledOnceWith(FakeDriver.groupBy, 'id', 'name', 'rate_number')
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumnsUsingGroupByRaw({ assert }: Context) {
    const sql = 'age WITH ROLLUP'
    Mock.when(FakeDriver, 'groupByRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.groupByRaw(sql)

    assert.calledOnceWith(FakeDriver.groupByRaw, sql)
  }

  @Test()
  public async shouldAddAHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const operator = '>'
    const value = 100
    Mock.when(FakeDriver, 'having').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.having(column, operator, value)

    assert.calledOnceWith(FakeDriver.having, column, operator, value)
  }

  @Test()
  public async shouldAddAHavingClauseToTheQueryParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'having').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.having('rate', '>', 100)

    assert.calledOnceWith(FakeDriver.having, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldAddAHavingRawSQLClauseToTheQuery({ assert }: Context) {
    const sql = 'id > 100'
    Mock.when(FakeDriver, 'havingRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingRaw(sql)

    assert.calledOnceWith(FakeDriver.havingRaw, sql)
  }

  @Test()
  public async shouldAddAHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'havingExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingExists(closure)

    assert.calledOnce(FakeDriver.havingExists)
  }

  @Test()
  public async shouldAddAHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'havingNotExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotExists(closure)

    assert.calledOnce(FakeDriver.havingNotExists)
  }

  @Test()
  public async shouldAddAHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'havingIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingIn(column, values)

    assert.calledOnce(FakeDriver.havingIn)
  }

  @Test()
  public async shouldAddAHavingInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'havingIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingIn(column, values)

    assert.calledOnceWith(FakeDriver.havingIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'havingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotIn(column, values)

    assert.calledOnce(FakeDriver.havingNotIn)
  }

  @Test()
  public async shouldAddAHavingNotInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'havingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotIn(column, values)

    assert.calledOnceWith(FakeDriver.havingNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'havingBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingBetween(column, values)

    assert.calledOnce(FakeDriver.havingBetween)
  }

  @Test()
  public async shouldAddAHavingBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'havingBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingBetween(column, values)

    assert.calledOnceWith(FakeDriver.havingBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'havingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotBetween(column, values)

    assert.calledOnce(FakeDriver.havingNotBetween)
  }

  @Test()
  public async shouldAddAHavingNotBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'havingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotBetween(column, values)

    assert.calledOnceWith(FakeDriver.havingNotBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'havingNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNull(column)

    assert.calledOnce(FakeDriver.havingNull)
  }

  @Test()
  public async shouldAddAHavingNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(FakeDriver, 'havingNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNull(column)

    assert.calledOnceWith(FakeDriver.havingNull, 'rate_number')
  }

  @Test()
  public async shouldAddAHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'havingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotNull(column)

    assert.calledOnce(FakeDriver.havingNotNull)
  }

  @Test()
  public async shouldAddAHavingNotNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(FakeDriver, 'havingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotNull(column)

    assert.calledOnceWith(FakeDriver.havingNotNull, 'rate_number')
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const operator = '>'
    const value = 100
    Mock.when(FakeDriver, 'orHaving').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHaving(column, operator, value)

    assert.calledOnceWith(FakeDriver.orHaving, column, operator, value)
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQueryParsingColumnNames({ assert }: Context) {
    Mock.when(FakeDriver, 'orHaving').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHaving('rate', '>', 100)

    assert.calledOnceWith(FakeDriver.orHaving, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldAddAnOrHavingRawSQLClauseToTheQuery({ assert }: Context) {
    const sql = 'id > 100'
    Mock.when(FakeDriver, 'orHavingRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingRaw(sql)

    assert.calledOnceWith(FakeDriver.orHavingRaw, sql)
  }

  @Test()
  public async shouldAddAnOrHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'orHavingExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingExists(closure)

    assert.calledOnce(FakeDriver.orHavingExists)
  }

  @Test()
  public async shouldAddAnOrHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'orHavingNotExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotExists(closure)

    assert.calledOnce(FakeDriver.orHavingNotExists)
  }

  @Test()
  public async shouldAddAnOrHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'orHavingIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingIn(column, values)

    assert.calledOnce(FakeDriver.orHavingIn)
  }

  @Test()
  public async shouldAddAnOrHavingInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'orHavingIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingIn(column, values)

    assert.calledOnceWith(FakeDriver.orHavingIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'orHavingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotIn(column, values)

    assert.calledOnce(FakeDriver.orHavingNotIn)
  }

  @Test()
  public async shouldAddAnOrHavingNotInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'orHavingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotIn(column, values)

    assert.calledOnceWith(FakeDriver.orHavingNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAnOrHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'orHavingBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingBetween(column, values)

    assert.calledOnce(FakeDriver.orHavingBetween)
  }

  @Test()
  public async shouldAddAnOrHavingBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'orHavingBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingBetween(column, values)

    assert.calledOnceWith(FakeDriver.orHavingBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'orHavingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotBetween(column, values)

    assert.calledOnce(FakeDriver.orHavingNotBetween)
  }

  @Test()
  public async shouldAddAnOrHavingNotBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'orHavingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotBetween(column, values)

    assert.calledOnceWith(FakeDriver.orHavingNotBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'orHavingNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNull(column)

    assert.calledOnce(FakeDriver.orHavingNull)
  }

  @Test()
  public async shouldAddAnOrHavingNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(FakeDriver, 'orHavingNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNull(column)

    assert.calledOnceWith(FakeDriver.orHavingNull, 'rate_number')
  }

  @Test()
  public async shouldAddAnOrHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'orHavingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotNull(column)

    assert.calledOnce(FakeDriver.orHavingNotNull)
  }

  @Test()
  public async shouldAddAnOrHavingNotNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(FakeDriver, 'orHavingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotNull(column)

    assert.calledOnceWith(FakeDriver.orHavingNotNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClause({ assert }: Context) {
    const column = 'id'
    const operation = '>'
    const value = 18
    Mock.when(FakeDriver, 'where').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.where(column, operation, value)

    assert.calledOnceWith(FakeDriver.where, column, operation, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseUsingObjects({ assert }: Context) {
    Mock.when(FakeDriver, 'where').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.where({ id: '18' })

    assert.calledOnceWith(FakeDriver.where, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseParsingColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'where').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.where('rate', '>', 100)

    assert.calledOnceWith(FakeDriver.where, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseUsingObjectParsingColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'where').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.where({ rate: 100 })

    assert.calledOnceWith(FakeDriver.where, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingRawWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(FakeDriver, 'whereRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereRaw(sql, ...bindings)

    assert.calledOnceWith(FakeDriver.whereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClause({ assert }: Context) {
    const column = 'id'
    const value = 18
    Mock.when(FakeDriver, 'whereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNot(column, value)

    assert.calledOnceWith(FakeDriver.whereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseUsingObject({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNot({ id: '18' })

    assert.calledOnceWith(FakeDriver.whereNot, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNot('rate', 100)

    assert.calledOnceWith(FakeDriver.whereNot, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNot({ rate: 100 })

    assert.calledOnceWith(FakeDriver.whereNot, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'whereExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereExists(closure)

    assert.calledOnce(FakeDriver.whereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'whereNotExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotExists(closure)

    assert.calledOnce(FakeDriver.whereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereLikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereLike('name', 'lenon')

    assert.calledOnceWith(FakeDriver.whereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereLikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereLike('rate', 100)

    assert.calledOnceWith(FakeDriver.whereLike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereILikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereILike('name', 'Lenon')

    assert.calledOnceWith(FakeDriver.whereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereILikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereILike('rate', 100)

    assert.calledOnceWith(FakeDriver.whereILike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereIn('id', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereIn('rate', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNoInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotIn('id', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereNotIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotInClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotIn('rate', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereBetween('id', [1, 10])

    assert.calledOnceWith(FakeDriver.whereBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereBetween('rate', [1, 10])

    assert.calledOnceWith(FakeDriver.whereBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotBetween('id', [1, 10])

    assert.calledOnceWith(FakeDriver.whereNotBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotBetween('rate', [1, 10])

    assert.calledOnceWith(FakeDriver.whereNotBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNull('id')

    assert.calledWith(FakeDriver.whereNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNull('rate')

    assert.calledWith(FakeDriver.whereNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotNull('id')

    assert.calledOnceWith(FakeDriver.whereNotNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotNull('rate')

    assert.calledOnceWith(FakeDriver.whereNotNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseUsingObjects({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhere').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhere({ id: '18' })

    assert.calledOnceWith(FakeDriver.orWhere, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseParsingColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhere').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhere('rate', '>', 100)

    assert.calledOnceWith(FakeDriver.orWhere, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseUsingObjectParsingColumn({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhere').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhere({ rate: 100 })

    assert.calledOnceWith(FakeDriver.orWhere, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingRawOrWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(FakeDriver, 'orWhereRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereRaw(sql, ...bindings)

    assert.calledOnceWith(FakeDriver.orWhereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClause({ assert }: Context) {
    const column = 'id'
    const value = 18
    Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNot(column, value)

    assert.calledOnceWith(FakeDriver.orWhereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseUsingObject({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNot({ id: '18' })

    assert.calledOnceWith(FakeDriver.orWhereNot, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNot('rate', 100)

    assert.calledOnceWith(FakeDriver.orWhereNot, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNot({ rate: 100 })

    assert.calledOnceWith(FakeDriver.orWhereNot, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').orWhereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'orWhereExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereExists(closure)

    assert.calledOnce(FakeDriver.orWhereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').orWhereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'orWhereNotExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotExists(closure)

    assert.calledOnce(FakeDriver.orWhereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereLike('name', 'lenon')

    assert.calledOnceWith(FakeDriver.orWhereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseUsingObject({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereLike({ name: 'lenon' })

    assert.calledOnceWith(FakeDriver.orWhereLike, { name: 'lenon' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereLike('rate', 100)

    assert.calledOnceWith(FakeDriver.orWhereLike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereLike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereLike({ rate: 100 })

    assert.calledOnceWith(FakeDriver.orWhereLike, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereILike('name', 'Lenon')

    assert.calledOnceWith(FakeDriver.orWhereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseUsingObject({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereILike({ name: 'Lenon' })

    assert.calledOnceWith(FakeDriver.orWhereILike, { name: 'Lenon' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereILike('rate', 100)

    assert.calledOnceWith(FakeDriver.orWhereILike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereILike({ rate: 100 })

    assert.calledOnceWith(FakeDriver.orWhereILike, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereIn('id', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereIn('rate', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNoInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotIn('id', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereNotIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotInClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotIn('rate', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereBetween('id', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereBetween('rate', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotBetween('id', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereNotBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotBetween('rate', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereNotBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNull('id')

    assert.calledOnceWith(FakeDriver.orWhereNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNull('rate')

    assert.calledOnceWith(FakeDriver.orWhereNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotNull('id')

    assert.calledOnceWith(FakeDriver.orWhereNotNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotNull('rate')

    assert.calledOnceWith(FakeDriver.orWhereNotNull, 'rate_number')
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirection({ assert }: Context) {
    const column = 'name'
    const direction = 'ASC'
    Mock.when(FakeDriver, 'orderBy').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orderBy(column, direction)

    assert.calledOnceWith(FakeDriver.orderBy, column, direction)
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirectionParsingColumnName({ assert }: Context) {
    Mock.when(FakeDriver, 'orderBy').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orderBy('createdAt', 'asc')

    assert.calledOnceWith(FakeDriver.orderBy, 'created_at', 'ASC')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatestUsingDefaultCreatedAt({ assert }: Context) {
    Mock.when(FakeDriver, 'latest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.latest()

    assert.calledOnceWith(FakeDriver.latest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
    Mock.when(FakeDriver, 'latest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.latest('createdAt')

    assert.calledOnceWith(FakeDriver.latest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldestUsingDefaultCreatedAt({ assert }: Context) {
    Mock.when(FakeDriver, 'oldest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.oldest()

    assert.calledOnceWith(FakeDriver.oldest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
    Mock.when(FakeDriver, 'oldest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.oldest('createdAt')

    assert.calledOnceWith(FakeDriver.oldest, 'created_at')
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirectionUsingRawSQL({ assert }: Context) {
    Mock.when(FakeDriver, 'orderByRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orderByRaw('name DESC NULLS LAST')

    assert.calledOnceWith(FakeDriver.orderByRaw, 'name DESC NULLS LAST')
  }

  @Test()
  public async shouldOffsetTheResultsByGivenValue({ assert }: Context) {
    const offsetValue = 10
    Mock.when(FakeDriver, 'offset').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.offset(offsetValue)

    assert.calledOnceWith(FakeDriver.offset, offsetValue)
  }

  @Test()
  public async shouldLimitTheNumberOfResultsReturned({ assert }: Context) {
    const limitValue = 10
    Mock.when(FakeDriver, 'limit').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.limit(limitValue)

    assert.calledOnceWith(FakeDriver.limit, limitValue)
  }
}
