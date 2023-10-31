/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Driver } from '#src/drivers/Driver'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { Test, Mock, BeforeEach, AfterEach, type Context } from '@athenna/test'

export default class QueryBuilderTest {
  private driver: Driver

  @BeforeEach()
  public beforeEach() {
    this.driver = FakeDriver
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumn({ assert }: Context) {
    const fakeMax = '200'
    Mock.when(this.driver, 'max').resolve(fakeMax)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.max('score')

    assert.calledWith(this.driver.max, 'score')
    assert.equal(result, fakeMax)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumn({ assert }: Context) {
    const fakeMin = '10'
    Mock.when(this.driver, 'min').resolve(fakeMin)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.min('score')

    assert.calledWith(this.driver.min, 'score')
    assert.equal(result, fakeMin)
  }

  @Test()
  public async shouldBeAbleToSumAllNumbersOfAGivenColumn({ assert }: Context) {
    const fakeSum = '1000'
    Mock.when(this.driver, 'sum').resolve(fakeSum)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.sum('score')

    assert.calledWith(this.driver.sum, 'score')
    assert.equal(result, fakeSum)
  }

  @Test()
  public async shouldBeAbleToSumDistinctValuesOfAGivenColumn({ assert }: Context) {
    const fakeSumDistinct = '900'
    Mock.when(this.driver, 'sumDistinct').resolve(fakeSumDistinct)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.sumDistinct('score')

    assert.calledWith(this.driver.sumDistinct, 'score')
    assert.equal(result, fakeSumDistinct)
  }

  @Test()
  public async shouldBeAbleToIncrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(this.driver, 'increment').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    await queryBuilder.increment('score')

    assert.calledOnce(this.driver.increment)
    assert.calledWith(this.driver.increment, 'score')
  }

  @Test()
  public async shouldBeAbleToDecrementAValueOfAGivenColumn({ assert }: Context) {
    Mock.when(this.driver, 'decrement').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    await queryBuilder.decrement('score')

    assert.calledOnce(this.driver.decrement)
    assert.calledWith(this.driver.decrement, 'score')
  }

  @Test()
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(this.driver, 'count').resolve(fakeCount)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.count()

    assert.calledOnce(this.driver.count)
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecords({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(this.driver, 'countDistinct').resolve(fakeCountDistinct)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.countDistinct('userId')

    assert.calledOnce(this.driver.countDistinct)
    assert.calledWith(this.driver.countDistinct, 'userId')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    Mock.when(this.driver, 'findOrFail').resolve(expectedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.findOrFail()

    assert.calledOnce(this.driver.findOrFail)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToFindDataOrExecuteTheCallback({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    const callback = async () => expectedData
    Mock.when(this.driver, 'findOr').resolve(expectedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.findOr(callback)

    assert.calledOnceWith(this.driver.findOr, callback)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToFindData({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    Mock.when(this.driver, 'find').resolve(expectedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.find()

    assert.calledOnce(this.driver.find)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToFindManyData({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(this.driver, 'findMany').resolve(expectedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.findMany()

    assert.calledOnce(this.driver.findMany)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToCreateData({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(this.driver, 'create').resolve(createdData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(this.driver.create, dataToCreate)
    assert.deepEqual(result, createdData)
  }

  @Test()
  public async shouldBeAbleToCreateManyData({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(this.driver, 'createMany').resolve(createdData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(this.driver.createMany, dataToCreate)
    assert.deepEqual(result, createdData)
  }

  @Test()
  public async shouldBeAbleToCreateOrUpdateData({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(this.driver, 'createOrUpdate').resolve(dataToCreateOrUpdate)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(this.driver.createOrUpdate, dataToCreateOrUpdate)
    assert.deepEqual(result, dataToCreateOrUpdate)
  }

  @Test()
  public async shouldBeAbleToUpdateData({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(this.driver, 'update').resolve(updatedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(this.driver.update, dataToUpdate)
    assert.deepEqual(result, updatedData)
  }

  @Test()
  public async shouldBeAbleToDeleteData({ assert }: Context) {
    Mock.when(this.driver, 'delete').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    await queryBuilder.delete()

    assert.calledOnce(this.driver.delete)
  }

  @Test()
  public async shouldBeAbleToPerformARawQuery({ assert }: Context) {
    const sqlQuery = 'SELECT * FROM users WHERE id = ?'
    const bindings = [1]
    const expectedResult = [{ id: '1', name: 'John Doe' }]
    Mock.when(this.driver, 'raw').resolve(expectedResult)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.raw(sqlQuery, bindings)

    assert.calledOnceWith(this.driver.raw, sqlQuery, bindings)
    assert.deepEqual(result, expectedResult)
  }

  @Test()
  public async shouldPaginateResultsAndReturnMetaDataForGivenPageAndLimit({ assert }: Context) {
    const page = 1
    const limit = 10
    const resourceUrl = '/users'
    const paginatedResult = { data: [], meta: { total: 0, perPage: limit, currentPage: page } }
    Mock.when(this.driver, 'paginate').resolve(paginatedResult)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.paginate(page, limit, resourceUrl)

    assert.calledOnceWith(this.driver.paginate, page, limit, resourceUrl)
    assert.deepEqual(result, paginatedResult)
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTable({ assert }: Context) {
    const columns = ['id', 'name']
    Mock.when(this.driver, 'select').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.select(...columns)

    assert.calledOnceWith(this.driver.select, ...columns)
  }

  @Test()
  public async shouldAllowRawSqlSelectionForSpecializedQueries({ assert }: Context) {
    const sql = 'COUNT(*) as userCount'
    Mock.when(this.driver, 'selectRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.selectRaw(sql)

    assert.calledOnceWith(this.driver.selectRaw, sql)
  }

  @Test()
  public async shouldJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    const tableName = 'posts'
    const column1 = 'users.id'
    const operation = '='
    const column2 = 'posts.user_id'
    Mock.when(this.driver, 'join').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.join(tableName, column1, operation, column2)

    assert.calledOnceWith(this.driver.join, tableName, column1, operation, column2)
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirection({ assert }: Context) {
    const column = 'name'
    const direction = 'ASC'
    Mock.when(this.driver, 'orderBy').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orderBy(column, direction)

    assert.calledOnceWith(this.driver.orderBy, column, direction)
  }

  @Test()
  public async shouldAllowGroupingBySpecifiedColumns({ assert }: Context) {
    const columns = ['account_id']
    Mock.when(this.driver, 'groupBy').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.groupBy(...columns)

    assert.calledOnceWith(this.driver.groupBy, ...columns)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClause({ assert }: Context) {
    const column = 'age'
    const operation = '>'
    const value = 18
    Mock.when(this.driver, 'where').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.where(column, operation, value)

    assert.calledOnceWith(this.driver.where, column, operation, value)
  }

  @Test()
  public async shouldFilterResultsUsingRawWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(this.driver, 'whereRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereRaw(sql, ...bindings)

    assert.calledOnceWith(this.driver.whereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldLimitTheNumberOfResultsReturned({ assert }: Context) {
    const limitValue = 10
    Mock.when(this.driver, 'limit').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.limit(limitValue)

    assert.calledOnceWith(this.driver.limit, limitValue)
  }

  @Test()
  public async shouldOffsetTheResultsByGivenValue({ assert }: Context) {
    const offsetValue = 10
    Mock.when(this.driver, 'offset').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.offset(offsetValue)

    assert.calledOnceWith(this.driver.offset, offsetValue)
  }

  @Test()
  public async shouldApplyLeftJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'leftJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.leftJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.leftJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldCountRowsBasedOnGivenColumn({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'count').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.count(column)

    assert.calledOnceWith(this.driver.count, column)
  }

  @Test()
  public async shouldSumValuesOfSpecifiedColumn({ assert }: Context) {
    const column = 'salary'
    Mock.when(this.driver, 'sum').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.sum(column)

    assert.calledOnceWith(this.driver.sum, column)
  }
}
