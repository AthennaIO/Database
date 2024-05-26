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
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { UniqueValueException } from '#src/exceptions/UniqueValueException'
import { UserNotSoftDelete } from '#tests/fixtures/models/UserNotSoftDelete'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { NullableValueException } from '#src/exceptions/NullableValueException'
import { Test, Mock, AfterEach, type Context, BeforeEach } from '@athenna/test'

export default class ModelQueryBuilderTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    new DatabaseProvider().register()
    Database.connection('fake')
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    Config.clear()
    ioc.reconstruct()
    User.setAttributes(true).uniqueValidation(true).nullableValidation(true)
  }

  @Test()
  public async shouldBeAbleToGetTheDriverClientOfTheModelQueryBuilder({ assert }: Context) {
    const result = await User.query().getClient()

    assert.deepEqual(Database.driver.getClient(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheDriverModelQueryBuilderOfTheModelQueryBuilder({ assert }: Context) {
    const result = await User.query().getQueryBuilder()

    assert.deepEqual(Database.driver.getQueryBuilder(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(Database.driver, 'avg').resolve(fakeAvg)

    const result = await User.query().avg('score')

    assert.calledWith(Database.driver.avg, 'score')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(Database.driver, 'avgDistinct').resolve(fakeAvg)

    const result = await User.query().avgDistinct('score')

    assert.calledWith(Database.driver.avgDistinct, 'score')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(Database.driver, 'avg').resolve(fakeAvg)

    const result = await User.query().avg('rate')

    assert.calledWith(Database.driver.avg, 'rate_number')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(Database.driver, 'avgDistinct').resolve(fakeAvg)

    const result = await User.query().avgDistinct('rate')

    assert.calledWith(Database.driver.avgDistinct, 'rate_number')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumn({ assert }: Context) {
    const fakeMax = '200'
    Mock.when(Database.driver, 'max').resolve(fakeMax)

    const result = await User.query().max('score')

    assert.calledWith(Database.driver.max, 'score')
    assert.equal(result, fakeMax)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumn({ assert }: Context) {
    const fakeMin = '10'
    Mock.when(Database.driver, 'min').resolve(fakeMin)

    const result = await User.query().min('score')

    assert.calledWith(Database.driver.min, 'score')
    assert.equal(result, fakeMin)
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeMax = '200'
    Mock.when(Database.driver, 'max').resolve(fakeMax)

    const result = await User.query().max('rate')

    assert.calledWith(Database.driver.max, 'rate_number')
    assert.equal(result, fakeMax)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeMin = '10'
    Mock.when(Database.driver, 'min').resolve(fakeMin)

    const result = await User.query().min('rate')

    assert.calledWith(Database.driver.min, 'rate_number')
    assert.equal(result, fakeMin)
  }

  @Test()
  public async shouldBeAbleToSumAllNumbersOfAGivenColumn({ assert }: Context) {
    const fakeSum = '1000'
    Mock.when(Database.driver, 'sum').resolve(fakeSum)

    const result = await User.query().sum('score')

    assert.calledWith(Database.driver.sum, 'score')
    assert.equal(result, fakeSum)
  }

  @Test()
  public async shouldBeAbleToSumDistinctValuesOfAGivenColumn({ assert }: Context) {
    const fakeSumDistinct = '900'
    Mock.when(Database.driver, 'sumDistinct').resolve(fakeSumDistinct)

    const result = await User.query().sumDistinct('score')

    assert.calledWith(Database.driver.sumDistinct, 'score')
    assert.equal(result, fakeSumDistinct)
  }

  @Test()
  public async shouldBeAbleToSumAllNumbersOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeSum = '1000'
    Mock.when(Database.driver, 'sum').resolve(fakeSum)

    const result = await User.query().sum('rate')

    assert.calledWith(Database.driver.sum, 'rate_number')
    assert.equal(result, fakeSum)
  }

  @Test()
  public async shouldBeAbleToSumDistinctValuesOfAGivenColumnParsingColumnName({ assert }: Context) {
    const fakeSumDistinct = '900'
    Mock.when(Database.driver, 'sumDistinct').resolve(fakeSumDistinct)

    const result = await User.query().sumDistinct('rate')

    assert.calledWith(Database.driver.sumDistinct, 'rate_number')
    assert.equal(result, fakeSumDistinct)
  }

  @Test()
  public async shouldBeAbleToIncrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(Database.driver, 'increment').resolve(undefined)

    await User.query().increment('score')

    assert.calledOnce(Database.driver.increment)
    assert.calledWith(Database.driver.increment, 'score')
  }

  @Test()
  public async shouldBeAbleToDecrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(Database.driver, 'decrement').resolve(undefined)

    await User.query().decrement('score')

    assert.calledOnce(Database.driver.decrement)
    assert.calledWith(Database.driver.decrement, 'score')
  }

  @Test()
  public async shouldBeAbleToIncrementAValueOfAGivenColumnParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'increment').resolve(undefined)

    await User.query().increment('rate')

    assert.calledOnce(Database.driver.increment)
    assert.calledWith(Database.driver.increment, 'rate_number')
  }

  @Test()
  public async shouldBeAbleToDecrementAValueOfAGivenColumnParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'decrement').resolve(undefined)

    await User.query().decrement('rate')

    assert.calledOnce(Database.driver.decrement)
    assert.calledWith(Database.driver.decrement, 'rate_number')
  }

  @Test()
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(Database.driver, 'count').resolve(fakeCount)

    const result = await User.query().count()

    assert.calledOnce(Database.driver.count)
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountRecordsByColumnName({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(Database.driver, 'count').resolve(fakeCount)

    const result = await User.query().count('id')

    assert.calledOnceWith(Database.driver.count, 'id')
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountRecordsByColumnNameParsingColumnName({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(Database.driver, 'count').resolve(fakeCount)

    const result = await User.query().count('rate')

    assert.calledOnceWith(Database.driver.count, 'rate_number')
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecords({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(Database.driver, 'countDistinct').resolve(fakeCountDistinct)

    const result = await User.query().countDistinct('id')

    assert.calledOnce(Database.driver.countDistinct)
    assert.calledWith(Database.driver.countDistinct, 'id')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecordsParsingColumnName({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(Database.driver, 'countDistinct').resolve(fakeCountDistinct)

    const result = await User.query().countDistinct('rate')

    assert.calledOnceWith(Database.driver.countDistinct, 'rate_number')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'John Doe' })

    const result = await User.query().findOrFail()

    assert.calledOnce(Database.driver.find)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldThrownNotFoundDataExceptionWhenFindOrFailReturnsUndefined({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)

    await assert.rejects(() => User.query().findOrFail(), NotFoundDataException)
    assert.calledOnce(Database.driver.find)
  }

  @Test()
  public async shouldBeAbleToFindDataOrExecuteTheCallback({ assert }: Context) {
    const callback = async () => null
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'John Doe' })

    await User.query().findOr(callback)

    assert.calledOnce(Database.driver.find)
  }

  @Test()
  public async shouldReturnClosureDataWhenDataIsUndefined({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    const callback = async () => expectedData
    Mock.when(Database.driver, 'find').resolve(undefined)

    const result = await User.query().findOr(callback)

    assert.deepEqual(result, expectedData)
    assert.calledOnce(Database.driver.find)
  }

  @Test()
  public async shouldBeAbleToFindData({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1', name: 'John Doe' })

    const result = await User.query().find()

    assert.calledOnce(Database.driver.find)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToFindManyData({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ])

    const result = await User.query().findMany()

    assert.calledOnce(Database.driver.findMany)
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToFindManyDataUsingCollection({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(Database.driver, 'findMany').resolve(expectedData)

    const result = await User.query().collection()

    assert.calledOnce(Database.driver.findMany)
    assert.instanceOf(result, Collection)
  }

  @Test()
  public async shouldBeAbleToFindManyDataAndPaginate({ assert }: Context) {
    Mock.when(Database.driver, 'findMany').resolve([{ id: '1', name: 'John Doe' }])

    const result = await User.query().paginate()

    assert.calledOnce(Database.driver.findMany)
    assert.instanceOf(result.data[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateData({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '3', ...dataToCreate }])

    const result = await User.query().create(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match(dataToCreate)])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataWithEmptyObject({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '3' }])

    const result = await User.query().create()

    assert.calledOnce(Database.driver.createMany)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldNotBeAbleToCreateDataWhenIsUniqueIsDefined({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '3' })

    await assert.rejects(() => User.query().uniqueValidation(true).create(), UniqueValueException)
  }

  @Test()
  public async shouldNotBeAbleToCreateDataWhenIsNullableIsDefined({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '3' })

    await assert.rejects(
      () => User.query().setAttributes(false).uniqueValidation(false).create(),
      NullableValueException
    )
  }

  @Test()
  public async shouldNotBeAbleToValidateIsNullableIfValidationsAreTurnedOff({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '3' })

    await assert.doesNotReject(
      () => User.query().setAttributes(false).uniqueValidation(false).nullableValidation(false).create(),
      NullableValueException
    )
  }

  @Test()
  public async shouldNotBeAbleToValidateIsUniqueIfValidationsAreTurnedOff({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '3' })

    await assert.doesNotReject(
      () => User.query().uniqueValidation(false).nullableValidation(false).create(),
      UniqueValueException
    )
  }

  @Test()
  public async shouldBeAbleToCreateDataAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '3', ...dataToCreate }])

    const result = await User.query().create(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match(dataToCreate)])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', rate: 1 }])

    const result = await User.query().create({ rate: 1 })

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ rate_number: 1 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldNotBeAbleToPersistColumnsWithPersistDisabledWhenUsingCreate({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    await User.query().create({ score: 200 })

    assert.notCalledWith(Database.driver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToCreateDataAndDoNotCleanPersist({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '3', score: 1 }])

    const result = await User.query().create({ score: 1 }, false)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ score: 1 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateMethod({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([createdData])

    const result = await User.query().create(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ ...dataToCreate, metadata1: 'random-1' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateMethodEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([createdData])

    const result = await User.query().create(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [
      Mock.match({ ...dataToCreate, metadata1: 'random-1', metadata2: 'random-2' })
    ])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateManyData({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ])

    const result = await User.query().createMany(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match(dataToCreate[0]), Mock.match(dataToCreate[1])])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateManyDataParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1', rate: 1 }])

    const result = await User.query().createMany([{ rate: 1 }])

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ rate_number: 1 })])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateManyDataAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([createdData])

    const result = await User.query().createMany(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [
      Mock.match({ ...dataToCreate[0], deletedAt: null }),
      Mock.match({ ...dataToCreate[1], deletedAt: null })
    ])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldNotBeAbleToPersistColumnsWithPersistDisabledWhenUsingCreateMany({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([{ id: '1' }])

    await User.query().createMany([{ score: 200 }])

    assert.notCalledWith(Database.driver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateManyMethod({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([createdData])

    const result = await User.query().createMany(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [
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
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([createdData])

    const result = await User.query().createMany(dataToCreate)

    assert.calledOnceWith(Database.driver.createMany, [
      Mock.match({ ...dataToCreate[0], metadata1: 'random-1', metadata2: 'random-2' }),
      Mock.match({ ...dataToCreate[1], metadata1: 'random-1', metadata2: 'random-2' })
    ])
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObject({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ name: 'Updated User' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ name: 'Updated User', deletedAt: null })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObjectParsingColumnNames({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', rate_number: 1 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate({ id: '1', name: 'Updated User', rate: 1 })

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ name: 'Updated User', rate_number: 1 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObjectAndIgnoringPersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.notCalledWith(Database.driver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateDataResolvingObjectWithoutCleaningPersist({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate, false)

    assert.calledWith(Database.driver.createMany, [Mock.match({ score: 200 })])
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToCreateData({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ metadata1: 'random-1' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToCreateDataEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ metadata1: 'random-1', metadata2: 'random-2' })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateWithoutCleaningPersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'createMany').resolve([dataToCreateOrUpdate])

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate, false)

    assert.calledOnceWith(Database.driver.createMany, [Mock.match({ score: 200 })])
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdate({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateWithoutCleaningPersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate, false)

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User', score: 200 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User', rate: 1 })

    Mock.when(User.query(), 'find').resolve({ id: '1', name: 'Updated User', rate: 1 })

    const result = await User.query().uniqueValidation(false).createOrUpdate({ name: 'Updated User', rate: 1 })

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User', rate_number: 1 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateAndSetDefaultTimestamps({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    Mock.when(User.query(), 'find').resolve(dataToCreateOrUpdate)

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateAndIgnorePersist({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    Mock.when(User.query(), 'find').resolve(dataToCreateOrUpdate)

    await User.query().createOrUpdate(dataToCreateOrUpdate)

    assert.notCalledWith(Database.driver.update, Mock.match({ score: 200 }))
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToUpdateData({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingCreateOrUpdateMethodToUpdateDataEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(dataToCreateOrUpdate)
    Mock.when(Database.driver, 'update').resolve(dataToCreateOrUpdate)

    const result = await User.query().uniqueValidation(false).createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateData({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User' })

    const result = await User.query().update({ name: 'Updated User' })

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingUpdateMethodWithoutCleaningPersist({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User', score: 200 })

    const result = await User.query().update({ name: 'Updated User', score: 200 }, false)

    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User', score: 200 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldNotBeAbleToUpdateDataWhenIsUniqueIsDefined({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    await assert.rejects(() => User.query().uniqueValidation(true).update({ id: '1' }), UniqueValueException)
  }

  @Test()
  public async shouldBeAbleToUpdateDataAndUpdateUpdatedAtColumn({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User' })

    const result = await User.query().update({ name: 'Updated User' })

    assert.notCalledWith(Database.driver.update, { name: 'Updated User' })
    assert.calledOnceWith(Database.driver.update, Mock.match({ name: 'Updated User' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataAndParseColumns({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User', rate_number: 1 })

    const result = await User.query().update({ name: 'Updated User', rate: 1 })

    assert.calledOnceWith(Database.driver.update, Mock.match({ rate_number: 1 }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateDataIgnoringPersistColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', score: 200 }

    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve({ id: '1', name: 'Updated User', score: 200 })

    await User.query().update(dataToUpdate)

    assert.notCalledWith(Database.driver.update, Mock.match({ score: 200 }))
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethod({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(Database.driver, 'find').resolve(updatedData)
    Mock.when(Database.driver, 'update').resolve(updatedData)

    const result = await User.query().uniqueValidation(false).update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyDefineDefaultAttributesWhenUsingUpdateMethodEvenIfPersistIsFalse({
    assert
  }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve(updatedData)

    const result = await User.query().update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleData({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const result = await User.query().update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataAndParseColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', rate: 1 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const result = await User.query().update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ rate_number: 1 }))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataAndUpdateUpdatedAtColumn({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    const result = await User.query().update(dataToUpdate)

    assert.notCalledWith(Database.driver.update, dataToUpdate)
    assert.calledOnceWith(Database.driver.update, Mock.match(dataToUpdate))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataIgnoringPersistColumns({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User', score: 200 }
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve([
      { id: '1', name: 'Updated User' },
      { id: '2', name: 'Updated User' }
    ])

    await User.query().update(dataToUpdate)

    assert.notCalledWith(Database.driver.update, Mock.match({ score: 200 }))
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
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'update').resolve(updatedData)

    const result = await User.query().update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1' }))
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
    Mock.when(Database.driver, 'find').resolve(updatedData)
    Mock.when(Database.driver, 'update').resolve(updatedData)

    const result = await User.query().uniqueValidation(false).update(dataToUpdate)

    assert.calledOnceWith(Database.driver.update, Mock.match({ metadata1: 'random-1', metadata2: 'random-2' }))
    assert.instanceOf(result[0], User)
  }

  @Test()
  public async shouldBeAbleToSoftDeleteData({ assert }: Context) {
    Mock.when(Database.driver, 'find').resolve(undefined)
    Mock.when(Database.driver, 'delete').resolve(undefined)

    await User.query().delete()

    assert.notCalled(Database.driver.delete)
  }

  @Test()
  public async shouldAutomaticallySetWhereNullDeletedAtClauseWhenIsDeleteDateColumnOptionIsTrue({ assert }: Context) {
    Mock.when(Database.driver, 'whereNull').return(undefined)

    await User.query().find()

    assert.calledOnceWith(Database.driver.whereNull, 'deletedAt')
  }

  @Test()
  public async shouldNotSetWhereNullDeletedAtClauseWhenModelDontHaveColumnWithIsDeleteDateColumnOptionAsTrue({
    assert
  }: Context) {
    Mock.when(Database.driver, 'whereNull').return(undefined)

    UserNotSoftDelete.query()

    assert.notCalled(Database.driver.whereNull)
  }

  @Test()
  public async shouldBeAbleToGetSoftDeletedData({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotNull').resolve(undefined)
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const result = await User.query().withTrashed().find()

    assert.instanceOf(result, User)
    assert.calledOnceWith(Database.driver.orWhereNotNull, 'deletedAt')
  }

  @Test()
  public async shouldBeAbleToGetOnlySoftDeletedData({ assert }: Context) {
    Mock.when(Database.driver, 'whereNull').resolve(undefined)
    Mock.when(Database.driver, 'whereNotNull').resolve(undefined)
    Mock.when(Database.driver, 'find').resolve({ id: '1' })

    const result = await User.query().onlyTrashed().find()

    assert.instanceOf(result, User)
    assert.notCalled(Database.driver.whereNull)
    assert.calledOnceWith(Database.driver.whereNotNull, 'deletedAt')
  }

  @Test()
  public async shouldBeAbleToRestoreSoftDeletedDate({ assert }: Context) {
    Mock.when(Database.driver, 'update').resolve({ id: '1' })

    const result = await User.query().uniqueValidation(false).restore()

    assert.instanceOf(result, User)
    assert.calledOnceWith(Database.driver.update, Mock.match({ deletedAt: null }))
  }

  @Test()
  public async shouldBeAbleToForceDeleteDataWhenUsingSoftDelete({ assert }: Context) {
    Mock.when(Database.driver, 'delete').resolve(undefined)

    await User.query().delete(true)

    assert.calledOnce(Database.driver.delete)
  }

  @Test()
  public async shouldDeleteDataIfThereIsNotDeleteDateColumnPresentInModel({ assert }: Context) {
    Mock.when(Database.driver, 'delete').resolve(undefined)

    await UserNotSoftDelete.query().delete()

    assert.calledOnce(Database.driver.delete)
  }

  @Test()
  public async shouldBeAbleToPerformARawQuery({ assert }: Context) {
    const sqlQuery = 'SELECT * FROM users WHERE id = ?'
    const bindings = [1]
    const expectedResult = [{ id: '1', name: 'John Doe' }]
    Mock.when(Database.driver, 'raw').resolve(expectedResult)

    const result = await User.query().raw(sqlQuery, bindings)

    assert.calledOnceWith(Database.driver.raw, sqlQuery, bindings)
    assert.deepEqual(result, expectedResult)
  }

  @Test()
  public async shouldBeAbleToChangeTheTableOfTheModelQueryBuilder({ assert }: Context) {
    Mock.when(Database.driver, 'table').resolve(undefined)

    User.query().table('profiles')

    assert.calledWith(Database.driver.table, 'profiles')
  }

  @Test()
  public async shouldExecuteTheGivenClosureWhenCriteriaIsTrue({ assert }: Context) {
    let called = false

    User.query().when(true, () => {
      called = true
    })

    assert.isTrue(called)
  }

  @Test()
  public async shouldNotExecuteTheGivenClosureWhenCriteriaIsNotTrue({ assert }: Context) {
    let called = false

    User.query().when(false, () => {
      called = true
    })

    assert.isFalse(called)
  }

  @Test()
  public async shouldBeAbleToDumpTheQueryCrafted({ assert }: Context) {
    Mock.when(Database.driver, 'dump').resolve(undefined)

    User.query().dump()

    assert.calledOnce(Database.driver.dump)
  }

  @Test()
  public async shouldPaginateResultsAndReturnMetaDataForGivenPageAndLimit({ assert }: Context) {
    const page = 1
    const limit = 10
    const resourceUrl = '/users'
    const paginatedResult = { data: [], meta: { total: 0, perPage: limit, currentPage: page } }
    Mock.when(Database.driver, 'paginate').resolve(paginatedResult)

    const result = await User.query().paginate(page, limit, resourceUrl)

    assert.calledOnceWith(Database.driver.paginate, page, limit, resourceUrl)
    assert.deepEqual(result, paginatedResult)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTable({ assert }: Context) {
    const columns: any[] = ['id', 'name']
    Mock.when(Database.driver, 'select').resolve(undefined)

    await User.query()
      .select(...columns)
      .find()

    assert.calledWith(Database.driver.select, ...columns)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'select').resolve(undefined)

    await User.query().select('id', 'name', 'rate').find()

    assert.calledWith(Database.driver.select, 'id', 'name', 'rate_number')
  }

  @Test()
  public async shouldAllowRawSqlSelectionForSpecializedQueries({ assert }: Context) {
    const sql = 'COUNT(*) as userCount'
    Mock.when(Database.driver, 'selectRaw').resolve(undefined)

    User.query().selectRaw(sql)

    assert.calledOnceWith(Database.driver.selectRaw, sql)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableUsingFrom({ assert }: Context) {
    const columns: any[] = ['id', 'name']
    Mock.when(Database.driver, 'select').resolve(undefined)
    Mock.when(Database.driver, 'from').resolve(undefined)

    await User.query()
      .select(...columns)
      .from('users')
      .find()

    assert.calledWith(Database.driver.select, ...columns)
    assert.calledOnceWith(Database.driver.from, 'users')
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTableUsingFromParsingNames({ assert }: Context) {
    Mock.when(Database.driver, 'select').resolve(undefined)
    Mock.when(Database.driver, 'from').resolve(undefined)

    await User.query().select('id', 'name', 'rate').from('users').find()

    assert.calledWith(Database.driver.select, 'id', 'name', 'rate_number')
    assert.calledOnceWith(Database.driver.from, 'users')
  }

  @Test()
  public async shouldAllowRawSqlSelectionForSpecializedQueriesUsingFromRaw({ assert }: Context) {
    const sql = 'COUNT(*) as userCount'
    Mock.when(Database.driver, 'selectRaw').resolve(undefined)
    Mock.when(Database.driver, 'fromRaw').resolve(undefined)

    User.query().selectRaw(sql).fromRaw('users')

    assert.calledOnceWith(Database.driver.selectRaw, sql)
    assert.calledOnceWith(Database.driver.fromRaw, 'users')
  }

  @Test()
  public async shouldJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    const tableName = 'posts'
    const column1 = 'users.id'
    const operation = '='
    const column2 = 'posts.user_id'
    Mock.when(Database.driver, 'join').resolve(undefined)

    User.query().join(tableName, column1, operation, column2)

    assert.calledOnceWith(Database.driver.join, tableName, column1, operation, column2)
  }

  @Test()
  public async shouldApplyLeftJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'leftJoin').resolve(undefined)

    User.query().leftJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.leftJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyRightJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'rightJoin').resolve(undefined)

    User.query().rightJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.rightJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyCrossJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'crossJoin').resolve(undefined)

    User.query().crossJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.crossJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyFullOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'fullOuterJoin').resolve(undefined)

    User.query().fullOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.fullOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyLeftOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'leftOuterJoin').resolve(undefined)

    User.query().leftOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.leftOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyRightOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(Database.driver, 'rightOuterJoin').resolve(undefined)

    User.query().rightOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(Database.driver.rightOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyJoinRawForGivenTableAndConditions({ assert }: Context) {
    const sql = 'NATURAL FULL JOIN users'
    Mock.when(Database.driver, 'joinRaw').resolve(undefined)

    User.query().joinRaw(sql)

    assert.calledOnceWith(Database.driver.joinRaw, sql)
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumns({ assert }: Context) {
    const columns: any[] = ['account_id']
    Mock.when(Database.driver, 'groupBy').resolve(undefined)

    User.query().groupBy(...columns)

    assert.calledOnceWith(Database.driver.groupBy, ...columns)
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumnsParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'groupBy').resolve(undefined)

    User.query().groupBy('id', 'name', 'rate')

    assert.calledOnceWith(Database.driver.groupBy, 'id', 'name', 'rate_number')
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumnsUsingGroupByRaw({ assert }: Context) {
    const sql = 'age WITH ROLLUP'
    Mock.when(Database.driver, 'groupByRaw').resolve(undefined)

    User.query().groupByRaw(sql)

    assert.calledOnceWith(Database.driver.groupByRaw, sql)
  }

  @Test()
  public async shouldAddAHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const operator = '>'
    const value = 100
    Mock.when(Database.driver, 'having').resolve(undefined)

    User.query().having(column, operator, value)

    assert.calledOnceWith(Database.driver.having, column, operator, value)
  }

  @Test()
  public async shouldAddAHavingClauseToTheQueryParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'having').resolve(undefined)

    User.query().having('rate', '>', 100)

    assert.calledOnceWith(Database.driver.having, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldAddAHavingRawSQLClauseToTheQuery({ assert }: Context) {
    const sql = 'id > 100'
    Mock.when(Database.driver, 'havingRaw').resolve(undefined)

    User.query().havingRaw(sql)

    assert.calledOnceWith(Database.driver.havingRaw, sql)
  }

  @Test()
  public async shouldAddAHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'havingExists').resolve(undefined)

    User.query().havingExists(closure)

    assert.calledOnce(Database.driver.havingExists)
  }

  @Test()
  public async shouldAddAHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'havingNotExists').resolve(undefined)

    User.query().havingNotExists(closure)

    assert.calledOnce(Database.driver.havingNotExists)
  }

  @Test()
  public async shouldAddAHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'havingIn').resolve(undefined)

    User.query().havingIn(column, values)

    assert.calledOnce(Database.driver.havingIn)
  }

  @Test()
  public async shouldAddAHavingInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'havingIn').resolve(undefined)

    User.query().havingIn(column, values)

    assert.calledOnceWith(Database.driver.havingIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'havingNotIn').resolve(undefined)

    User.query().havingNotIn(column, values)

    assert.calledOnce(Database.driver.havingNotIn)
  }

  @Test()
  public async shouldAddAHavingNotInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'havingNotIn').resolve(undefined)

    User.query().havingNotIn(column, values)

    assert.calledOnceWith(Database.driver.havingNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'havingBetween').resolve(undefined)

    User.query().havingBetween(column, values)

    assert.calledOnce(Database.driver.havingBetween)
  }

  @Test()
  public async shouldAddAHavingBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'havingBetween').resolve(undefined)

    User.query().havingBetween(column, values)

    assert.calledOnceWith(Database.driver.havingBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'havingNotBetween').resolve(undefined)

    User.query().havingNotBetween(column, values)

    assert.calledOnce(Database.driver.havingNotBetween)
  }

  @Test()
  public async shouldAddAHavingNotBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'havingNotBetween').resolve(undefined)

    User.query().havingNotBetween(column, values)

    assert.calledOnceWith(Database.driver.havingNotBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(Database.driver, 'havingNull').resolve(undefined)

    User.query().havingNull(column)

    assert.calledOnce(Database.driver.havingNull)
  }

  @Test()
  public async shouldAddAHavingNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(Database.driver, 'havingNull').resolve(undefined)

    User.query().havingNull(column)

    assert.calledOnceWith(Database.driver.havingNull, 'rate_number')
  }

  @Test()
  public async shouldAddAHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(Database.driver, 'havingNotNull').resolve(undefined)

    User.query().havingNotNull(column)

    assert.calledOnce(Database.driver.havingNotNull)
  }

  @Test()
  public async shouldAddAHavingNotNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(Database.driver, 'havingNotNull').resolve(undefined)

    User.query().havingNotNull(column)

    assert.calledOnceWith(Database.driver.havingNotNull, 'rate_number')
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const operator = '>'
    const value = 100
    Mock.when(Database.driver, 'orHaving').resolve(undefined)

    User.query().orHaving(column, operator, value)

    assert.calledOnceWith(Database.driver.orHaving, column, operator, value)
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQueryParsingColumnNames({ assert }: Context) {
    Mock.when(Database.driver, 'orHaving').resolve(undefined)

    User.query().orHaving('rate', '>', 100)

    assert.calledOnceWith(Database.driver.orHaving, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldAddAnOrHavingRawSQLClauseToTheQuery({ assert }: Context) {
    const sql = 'id > 100'
    Mock.when(Database.driver, 'orHavingRaw').resolve(undefined)

    User.query().orHavingRaw(sql)

    assert.calledOnceWith(Database.driver.orHavingRaw, sql)
  }

  @Test()
  public async shouldAddAnOrHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'orHavingExists').resolve(undefined)

    User.query().orHavingExists(closure)

    assert.calledOnce(Database.driver.orHavingExists)
  }

  @Test()
  public async shouldAddAnOrHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'orHavingNotExists').resolve(undefined)

    User.query().orHavingNotExists(closure)

    assert.calledOnce(Database.driver.orHavingNotExists)
  }

  @Test()
  public async shouldAddAnOrHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'orHavingIn').resolve(undefined)

    User.query().orHavingIn(column, values)

    assert.calledOnce(Database.driver.orHavingIn)
  }

  @Test()
  public async shouldAddAnOrHavingInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'orHavingIn').resolve(undefined)

    User.query().orHavingIn(column, values)

    assert.calledOnceWith(Database.driver.orHavingIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'orHavingNotIn').resolve(undefined)

    User.query().orHavingNotIn(column, values)

    assert.calledOnce(Database.driver.orHavingNotIn)
  }

  @Test()
  public async shouldAddAnOrHavingNotInClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    const values = [1, 2, 3]
    Mock.when(Database.driver, 'orHavingNotIn').resolve(undefined)

    User.query().orHavingNotIn(column, values)

    assert.calledOnceWith(Database.driver.orHavingNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldAddAnOrHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'orHavingBetween').resolve(undefined)

    User.query().orHavingBetween(column, values)

    assert.calledOnce(Database.driver.orHavingBetween)
  }

  @Test()
  public async shouldAddAnOrHavingBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'orHavingBetween').resolve(undefined)

    User.query().orHavingBetween(column, values)

    assert.calledOnceWith(Database.driver.orHavingBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'orHavingNotBetween').resolve(undefined)

    User.query().orHavingNotBetween(column, values)

    assert.calledOnce(Database.driver.orHavingNotBetween)
  }

  @Test()
  public async shouldAddAnOrHavingNotBetweenClauseToTheQueryParsingColumnName({ assert }: Context) {
    const column = 'rate'
    const values: [number, number] = [1, 3]
    Mock.when(Database.driver, 'orHavingNotBetween').resolve(undefined)

    User.query().orHavingNotBetween(column, values)

    assert.calledOnceWith(Database.driver.orHavingNotBetween, 'rate_number', [1, 3])
  }

  @Test()
  public async shouldAddAnOrHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(Database.driver, 'orHavingNull').resolve(undefined)

    User.query().orHavingNull(column)

    assert.calledOnce(Database.driver.orHavingNull)
  }

  @Test()
  public async shouldAddAnOrHavingNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(Database.driver, 'orHavingNull').resolve(undefined)

    User.query().orHavingNull(column)

    assert.calledOnceWith(Database.driver.orHavingNull, 'rate_number')
  }

  @Test()
  public async shouldAddAnOrHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(Database.driver, 'orHavingNotNull').resolve(undefined)

    User.query().orHavingNotNull(column)

    assert.calledOnce(Database.driver.orHavingNotNull)
  }

  @Test()
  public async shouldAddAnOrHavingNotNullClauseToTheQueryParsingColumnNames({ assert }: Context) {
    const column = 'rate'
    Mock.when(Database.driver, 'orHavingNotNull').resolve(undefined)

    User.query().orHavingNotNull(column)

    assert.calledOnceWith(Database.driver.orHavingNotNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClause({ assert }: Context) {
    const column = 'id'
    const operation = '>'
    const value = 18
    Mock.when(Database.driver, 'where').resolve(undefined)

    User.query().where(column, operation, value)

    assert.calledOnceWith(Database.driver.where, column, operation, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseUsingObjects({ assert }: Context) {
    Mock.when(Database.driver, 'where').resolve(undefined)

    User.query().where({ id: '18' })

    assert.calledOnceWith(Database.driver.where, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseParsingColumn({ assert }: Context) {
    Mock.when(Database.driver, 'where').resolve(undefined)

    User.query().where('rate', '>', 100)

    assert.calledOnceWith(Database.driver.where, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClauseUsingObjectParsingColumn({ assert }: Context) {
    Mock.when(Database.driver, 'where').resolve(undefined)

    User.query().where({ rate: 100 })

    assert.calledOnceWith(Database.driver.where, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingRawWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(Database.driver, 'whereRaw').resolve(undefined)

    User.query().whereRaw(sql, ...bindings)

    assert.calledOnceWith(Database.driver.whereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClause({ assert }: Context) {
    const column = 'id'
    const value = 18
    Mock.when(Database.driver, 'whereNot').resolve(undefined)

    User.query().whereNot(column, value)

    assert.calledOnceWith(Database.driver.whereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseUsingObject({ assert }: Context) {
    Mock.when(Database.driver, 'whereNot').resolve(undefined)

    User.query().whereNot({ id: '18' })

    assert.calledOnceWith(Database.driver.whereNot, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNot').resolve(undefined)

    User.query().whereNot('rate', 100)

    assert.calledOnceWith(Database.driver.whereNot, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNot').resolve(undefined)

    User.query().whereNot({ rate: 100 })

    assert.calledOnceWith(Database.driver.whereNot, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'whereExists').resolve(undefined)

    User.query().whereExists(closure)

    assert.calledOnce(Database.driver.whereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'whereNotExists').resolve(undefined)

    User.query().whereNotExists(closure)

    assert.calledOnce(Database.driver.whereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereLikeClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereLike').resolve(undefined)

    User.query().whereLike('name', 'lenon')

    assert.calledOnceWith(Database.driver.whereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereLikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereLike').resolve(undefined)

    User.query().whereLike('rate', 100)

    assert.calledOnceWith(Database.driver.whereLike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereILikeClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereILike').resolve(undefined)

    User.query().whereILike('name', 'Lenon')

    assert.calledOnceWith(Database.driver.whereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereILikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereILike').resolve(undefined)

    User.query().whereILike('rate', 100)

    assert.calledOnceWith(Database.driver.whereILike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereIn').resolve(undefined)

    User.query().whereIn('id', [1, 2, 3])

    assert.calledOnceWith(Database.driver.whereIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereIn').resolve(undefined)

    User.query().whereIn('rate', [1, 2, 3])

    assert.calledOnceWith(Database.driver.whereIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNoInClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotIn').resolve(undefined)

    User.query().whereNotIn('id', [1, 2, 3])

    assert.calledOnceWith(Database.driver.whereNotIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotInClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotIn').resolve(undefined)

    User.query().whereNotIn('rate', [1, 2, 3])

    assert.calledOnceWith(Database.driver.whereNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereBetween').resolve(undefined)

    User.query().whereBetween('id', [1, 10])

    assert.calledOnceWith(Database.driver.whereBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereBetween').resolve(undefined)

    User.query().whereBetween('rate', [1, 10])

    assert.calledOnceWith(Database.driver.whereBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotBetween').resolve(undefined)

    User.query().whereNotBetween('id', [1, 10])

    assert.calledOnceWith(Database.driver.whereNotBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotBetween').resolve(undefined)

    User.query().whereNotBetween('rate', [1, 10])

    assert.calledOnceWith(Database.driver.whereNotBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereNull').resolve(undefined)

    User.query().whereNull('id')

    assert.calledWith(Database.driver.whereNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNull').resolve(undefined)

    User.query().whereNull('rate')

    assert.calledWith(Database.driver.whereNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClause({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotNull').resolve(undefined)

    User.query().whereNotNull('id')

    assert.calledOnceWith(Database.driver.whereNotNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'whereNotNull').resolve(undefined)

    User.query().whereNotNull('rate')

    assert.calledOnceWith(Database.driver.whereNotNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseUsingObjects({ assert }: Context) {
    Mock.when(Database.driver, 'orWhere').resolve(undefined)

    User.query().orWhere({ id: '18' })

    assert.calledOnceWith(Database.driver.orWhere, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseParsingColumn({ assert }: Context) {
    Mock.when(Database.driver, 'orWhere').resolve(undefined)

    User.query().orWhere('rate', '>', 100)

    assert.calledOnceWith(Database.driver.orWhere, 'rate_number', '>', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClauseUsingObjectParsingColumn({ assert }: Context) {
    Mock.when(Database.driver, 'orWhere').resolve(undefined)

    User.query().orWhere({ rate: 100 })

    assert.calledOnceWith(Database.driver.orWhere, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingRawOrWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(Database.driver, 'orWhereRaw').resolve(undefined)

    User.query().orWhereRaw(sql, ...bindings)

    assert.calledOnceWith(Database.driver.orWhereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClause({ assert }: Context) {
    const column = 'id'
    const value = 18
    Mock.when(Database.driver, 'orWhereNot').resolve(undefined)

    User.query().orWhereNot(column, value)

    assert.calledOnceWith(Database.driver.orWhereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseUsingObject({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNot').resolve(undefined)

    User.query().orWhereNot({ id: '18' })

    assert.calledOnceWith(Database.driver.orWhereNot, { id: '18' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNot').resolve(undefined)

    User.query().orWhereNot('rate', 100)

    assert.calledOnceWith(Database.driver.orWhereNot, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNot').resolve(undefined)

    User.query().orWhereNot({ rate: 100 })

    assert.calledOnceWith(Database.driver.orWhereNot, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').orWhereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'orWhereExists').resolve(undefined)

    User.query().orWhereExists(closure)

    assert.calledOnce(Database.driver.orWhereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').orWhereRaw('users.account_id = accounts.id')
    }
    Mock.when(Database.driver, 'orWhereNotExists').resolve(undefined)

    User.query().orWhereNotExists(closure)

    assert.calledOnce(Database.driver.orWhereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereLike').resolve(undefined)

    User.query().orWhereLike('name', 'lenon')

    assert.calledOnceWith(Database.driver.orWhereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseUsingObject({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereLike').resolve(undefined)

    User.query().orWhereLike({ name: 'lenon' })

    assert.calledOnceWith(Database.driver.orWhereLike, { name: 'lenon' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereLike').resolve(undefined)

    User.query().orWhereLike('rate', 100)

    assert.calledOnceWith(Database.driver.orWhereLike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereLike').resolve(undefined)

    User.query().orWhereLike({ rate: 100 })

    assert.calledOnceWith(Database.driver.orWhereLike, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereILike').resolve(undefined)

    User.query().orWhereILike('name', 'Lenon')

    assert.calledOnceWith(Database.driver.orWhereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseUsingObject({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereILike').resolve(undefined)

    User.query().orWhereILike({ name: 'Lenon' })

    assert.calledOnceWith(Database.driver.orWhereILike, { name: 'Lenon' })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereILike').resolve(undefined)

    User.query().orWhereILike('rate', 100)

    assert.calledOnceWith(Database.driver.orWhereILike, 'rate_number', 100)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClauseUsingObjectParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereILike').resolve(undefined)

    User.query().orWhereILike({ rate: 100 })

    assert.calledOnceWith(Database.driver.orWhereILike, { rate_number: 100 })
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereIn').resolve(undefined)

    User.query().orWhereIn('id', [1, 2, 3])

    assert.calledOnceWith(Database.driver.orWhereIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereIn').resolve(undefined)

    User.query().orWhereIn('rate', [1, 2, 3])

    assert.calledOnceWith(Database.driver.orWhereIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNoInClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotIn').resolve(undefined)

    User.query().orWhereNotIn('id', [1, 2, 3])

    assert.calledOnceWith(Database.driver.orWhereNotIn, 'id', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotInClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotIn').resolve(undefined)

    User.query().orWhereNotIn('rate', [1, 2, 3])

    assert.calledOnceWith(Database.driver.orWhereNotIn, 'rate_number', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereBetween').resolve(undefined)

    User.query().orWhereBetween('id', [1, 10])

    assert.calledOnceWith(Database.driver.orWhereBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereBetween').resolve(undefined)

    User.query().orWhereBetween('rate', [1, 10])

    assert.calledOnceWith(Database.driver.orWhereBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotBetween').resolve(undefined)

    User.query().orWhereNotBetween('id', [1, 10])

    assert.calledOnceWith(Database.driver.orWhereNotBetween, 'id', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotBetween').resolve(undefined)

    User.query().orWhereNotBetween('rate', [1, 10])

    assert.calledOnceWith(Database.driver.orWhereNotBetween, 'rate_number', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNull').resolve(undefined)

    User.query().orWhereNull('id')

    assert.calledOnceWith(Database.driver.orWhereNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNull').resolve(undefined)

    User.query().orWhereNull('rate')

    assert.calledOnceWith(Database.driver.orWhereNull, 'rate_number')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClause({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotNull').resolve(undefined)

    User.query().orWhereNotNull('id')

    assert.calledOnceWith(Database.driver.orWhereNotNull, 'id')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClauseParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orWhereNotNull').resolve(undefined)

    User.query().orWhereNotNull('rate')

    assert.calledOnceWith(Database.driver.orWhereNotNull, 'rate_number')
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirection({ assert }: Context) {
    const column = 'name'
    const direction = 'ASC'
    Mock.when(Database.driver, 'orderBy').resolve(undefined)

    User.query().orderBy(column, direction)

    assert.calledOnceWith(Database.driver.orderBy, column, direction)
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirectionParsingColumnName({ assert }: Context) {
    Mock.when(Database.driver, 'orderBy').resolve(undefined)

    User.query().orderBy('createdAt', 'asc')

    assert.calledOnceWith(Database.driver.orderBy, 'created_at', 'ASC')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatestUsingDefaultCreatedAt({ assert }: Context) {
    Mock.when(Database.driver, 'latest').resolve(undefined)

    User.query().latest()

    assert.calledOnceWith(Database.driver.latest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
    Mock.when(Database.driver, 'latest').resolve(undefined)

    User.query().latest('createdAt')

    assert.calledOnceWith(Database.driver.latest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldestUsingDefaultCreatedAt({ assert }: Context) {
    Mock.when(Database.driver, 'oldest').resolve(undefined)

    User.query().oldest()

    assert.calledOnceWith(Database.driver.oldest, 'created_at')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
    Mock.when(Database.driver, 'oldest').resolve(undefined)

    User.query().oldest('createdAt')

    assert.calledOnceWith(Database.driver.oldest, 'created_at')
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirectionUsingRawSQL({ assert }: Context) {
    Mock.when(Database.driver, 'orderByRaw').resolve(undefined)

    User.query().orderByRaw('name DESC NULLS LAST')

    assert.calledOnceWith(Database.driver.orderByRaw, 'name DESC NULLS LAST')
  }

  @Test()
  public async shouldOffsetTheResultsByGivenValue({ assert }: Context) {
    const offsetValue = 10
    Mock.when(Database.driver, 'offset').resolve(undefined)

    User.query().offset(offsetValue)

    assert.calledOnceWith(Database.driver.offset, offsetValue)
  }

  @Test()
  public async shouldLimitTheNumberOfResultsReturned({ assert }: Context) {
    const limitValue = 10
    Mock.when(Database.driver, 'limit').resolve(undefined)

    User.query().limit(limitValue)

    assert.calledOnceWith(Database.driver.limit, limitValue)
  }
}
