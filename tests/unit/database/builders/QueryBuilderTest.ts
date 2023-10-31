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
  public async shouldBeAbleToGetTheDriverClientOfTheQueryBuilder({ assert }: Context) {
    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.getClient()

    assert.deepEqual(FakeDriver.getClient(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheDriverQueryBuilderOfTheQueryBuilder({ assert }: Context) {
    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.getQueryBuilder()

    assert.deepEqual(FakeDriver.getQueryBuilder(), result)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(this.driver, 'avg').resolve(fakeAvg)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.avg('score')

    assert.calledWith(this.driver.avg, 'score')
    assert.equal(result, fakeAvg)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumn({ assert }: Context) {
    const fakeAvg = '200'
    Mock.when(this.driver, 'avgDistinct').resolve(fakeAvg)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.avgDistinct('score')

    assert.calledWith(this.driver.avgDistinct, 'score')
    assert.equal(result, fakeAvg)
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
  public async shouldBeAbleToFindManyDataUsingCollection({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(this.driver, 'collection').resolve(expectedData)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    const result = await queryBuilder.collection()

    assert.calledOnce(this.driver.collection)
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
  public async shouldBeAbleToChangeTheTableOfTheQueryBuilder({ assert }: Context) {
    Mock.when(this.driver, 'table').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.table('profiles')

    assert.calledWith(this.driver.table, 'profiles')
  }

  @Test()
  public async shouldExecuteTheGivenClosureWhenCriteriaIsNotTrue({ assert }: Context) {
    let called = false
    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.when(true, () => {
      called = true
    })

    assert.isTrue(called)
  }

  @Test()
  public async shouldBeAbleToDumpTheQueryCrafted({ assert }: Context) {
    Mock.when(this.driver, 'dump').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.dump()

    assert.calledOnce(this.driver.dump)
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
  public async shouldApplyRightJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'rightJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.rightJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.rightJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyCrossJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'crossJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.crossJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.crossJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyFullOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'fullOuterJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.fullOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.fullOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyLeftOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'leftOuterJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.leftOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.leftOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyRightOuterJoinForGivenTableAndConditions({ assert }: Context) {
    const table = 'profiles'
    const firstColumn = 'users.id'
    const secondColumn = 'profiles.user_id'
    Mock.when(this.driver, 'rightOuterJoin').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.rightOuterJoin(table, firstColumn, secondColumn)

    assert.calledOnceWith(this.driver.rightOuterJoin, table, firstColumn, secondColumn)
  }

  @Test()
  public async shouldApplyJoinRawForGivenTableAndConditions({ assert }: Context) {
    const sql = 'NATURAL FULL JOIN users'
    Mock.when(this.driver, 'joinRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.joinRaw(sql)

    assert.calledOnceWith(this.driver.joinRaw, sql)
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
  public async shouldAllowGroupingBySpecifiedColumnsUsingGroupByRaw({ assert }: Context) {
    const sql = 'age WITH ROLLUP'
    Mock.when(this.driver, 'groupByRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.groupByRaw(sql)

    assert.calledOnceWith(this.driver.groupByRaw, sql)
  }

  @Test()
  public async shouldAddAHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const operator = '>'
    const value = 100
    Mock.when(this.driver, 'having').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.having(column, operator, value)

    assert.calledOnceWith(this.driver.having, column, operator, value)
  }

  @Test()
  public async shouldAddAHavingRawSQLClauseToTheQuery({ assert }: Context) {
    const sql = 'id > 100'
    Mock.when(this.driver, 'havingRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingRaw(sql)

    assert.calledOnceWith(this.driver.havingRaw, sql)
  }

  @Test()
  public async shouldAddAHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'havingExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingExists(closure)

    assert.calledOnce(this.driver.havingExists)
  }

  @Test()
  public async shouldAddAHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'havingNotExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingNotExists(closure)

    assert.calledOnce(this.driver.havingNotExists)
  }

  @Test()
  public async shouldAddAHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(this.driver, 'havingIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingIn(column, values)

    assert.calledOnce(this.driver.havingIn)
  }

  @Test()
  public async shouldAddAHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(this.driver, 'havingNotIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingNotIn(column, values)

    assert.calledOnce(this.driver.havingNotIn)
  }

  @Test()
  public async shouldAddAHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(this.driver, 'havingBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingBetween(column, values)

    assert.calledOnce(this.driver.havingBetween)
  }

  @Test()
  public async shouldAddAHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(this.driver, 'havingNotBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingNotBetween(column, values)

    assert.calledOnce(this.driver.havingNotBetween)
  }

  @Test()
  public async shouldAddAHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'havingNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingNull(column)

    assert.calledOnce(this.driver.havingNull)
  }

  @Test()
  public async shouldAddAHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'havingNotNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.havingNotNull(column)

    assert.calledOnce(this.driver.havingNotNull)
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'orHaving').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHaving(column)

    assert.calledOnce(this.driver.orHaving)
  }

  @Test()
  public async shouldAddAnOrHavingRawSQLClauseToTheQuery({ assert }: Context) {
    Mock.when(this.driver, 'orHavingRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingRaw('age > 100')

    assert.calledOnce(this.driver.orHavingRaw)
  }

  @Test()
  public async shouldAddAnOrHavingExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'orHavingExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingExists(closure)

    assert.calledOnce(this.driver.orHavingExists)
  }

  @Test()
  public async shouldAddAnOrHavingNotExistsClauseToTheQuery({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'orHavingNotExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingNotExists(closure)

    assert.calledOnce(this.driver.orHavingNotExists)
  }

  @Test()
  public async shouldAddAnOrHavingInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(this.driver, 'orHavingIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingIn(column, values)

    assert.calledOnce(this.driver.orHavingIn)
  }

  @Test()
  public async shouldAddAnOrHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(this.driver, 'orHavingNotIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingNotIn(column, values)

    assert.calledOnce(this.driver.orHavingNotIn)
  }

  @Test()
  public async shouldAddAnOrHavingBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(this.driver, 'orHavingBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingBetween(column, values)

    assert.calledOnce(this.driver.orHavingBetween)
  }

  @Test()
  public async shouldAddAnOrHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(this.driver, 'orHavingNotBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingNotBetween(column, values)

    assert.calledOnce(this.driver.orHavingNotBetween)
  }

  @Test()
  public async shouldAddAnOrHavingNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'orHavingNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingNull(column)

    assert.calledOnce(this.driver.orHavingNull)
  }

  @Test()
  public async shouldAddAnOrHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(this.driver, 'orHavingNotNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orHavingNotNull(column)

    assert.calledOnce(this.driver.orHavingNotNull)
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
  public async shouldFilterResultsUsingGivenWhereNotClause({ assert }: Context) {
    const column = 'age'
    const value = 18
    Mock.when(this.driver, 'whereNot').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNot(column, value)

    assert.calledOnceWith(this.driver.whereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'whereExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereExists(closure)

    assert.calledOnce(this.driver.whereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'whereNotExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNotExists(closure)

    assert.calledOnce(this.driver.whereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereLikeClause({ assert }: Context) {
    Mock.when(this.driver, 'whereLike').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereLike('name', 'lenon')

    assert.calledOnceWith(this.driver.whereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereILikeClause({ assert }: Context) {
    Mock.when(this.driver, 'whereILike').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereILike('name', 'Lenon')

    assert.calledOnceWith(this.driver.whereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClause({ assert }: Context) {
    Mock.when(this.driver, 'whereIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereIn('age', [1, 2, 3])

    assert.calledOnceWith(this.driver.whereIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNoInClause({ assert }: Context) {
    Mock.when(this.driver, 'whereNotIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNotIn('age', [1, 2, 3])

    assert.calledOnceWith(this.driver.whereNotIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClause({ assert }: Context) {
    Mock.when(this.driver, 'whereBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereBetween('age', [1, 10])

    assert.calledOnceWith(this.driver.whereBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClause({ assert }: Context) {
    Mock.when(this.driver, 'whereNotBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNotBetween('age', [1, 10])

    assert.calledOnceWith(this.driver.whereNotBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClause({ assert }: Context) {
    Mock.when(this.driver, 'whereNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNull('age')

    assert.calledOnceWith(this.driver.whereNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClause({ assert }: Context) {
    Mock.when(this.driver, 'whereNotNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.whereNotNull('age')

    assert.calledOnceWith(this.driver.whereNotNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClause({ assert }: Context) {
    const column = 'age'
    const operation = '>'
    const value = 18
    Mock.when(this.driver, 'orWhere').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhere(column, operation, value)

    assert.calledOnceWith(this.driver.orWhere, column, operation, value)
  }

  @Test()
  public async shouldFilterResultsUsingRawOrWhereClauseForComplexConditions({ assert }: Context) {
    const sql = 'age > ? AND account_id IS NOT NULL'
    const bindings = [18]
    Mock.when(this.driver, 'orWhereRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereRaw(sql, ...bindings)

    assert.calledOnceWith(this.driver.orWhereRaw, sql, ...bindings)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotClause({ assert }: Context) {
    const column = 'age'
    const value = 18
    Mock.when(this.driver, 'orWhereNot').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNot(column, value)

    assert.calledOnceWith(this.driver.orWhereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'orWhereExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereExists(closure)

    assert.calledOnce(this.driver.orWhereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(this.driver, 'orWhereNotExists').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNotExists(closure)

    assert.calledOnce(this.driver.orWhereNotExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereLikeClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereLike').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereLike('name', 'lenon')

    assert.calledOnceWith(this.driver.orWhereLike, 'name', 'lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereILikeClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereILike').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereILike('name', 'Lenon')

    assert.calledOnceWith(this.driver.orWhereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereIn('age', [1, 2, 3])

    assert.calledOnceWith(this.driver.orWhereIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNoInClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereNotIn').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNotIn('age', [1, 2, 3])

    assert.calledOnceWith(this.driver.orWhereNotIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereBetween('age', [1, 10])

    assert.calledOnceWith(this.driver.orWhereBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereNotBetween').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNotBetween('age', [1, 10])

    assert.calledOnceWith(this.driver.orWhereNotBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNull('age')

    assert.calledOnceWith(this.driver.orWhereNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClause({ assert }: Context) {
    Mock.when(this.driver, 'orWhereNotNull').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orWhereNotNull('age')

    assert.calledOnceWith(this.driver.orWhereNotNull, 'age')
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
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
    Mock.when(this.driver, 'latest').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.latest('createdAt')

    assert.calledOnceWith(this.driver.latest, 'createdAt')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
    Mock.when(this.driver, 'oldest').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.oldest('createdAt')

    assert.calledOnceWith(this.driver.oldest, 'createdAt')
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInGivenDirectionUsingRawSQL({ assert }: Context) {
    Mock.when(this.driver, 'orderByRaw').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.orderByRaw('name DESC NULLS LAST')

    assert.calledOnceWith(this.driver.orderByRaw, 'name DESC NULLS LAST')
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
  public async shouldLimitTheNumberOfResultsReturned({ assert }: Context) {
    const limitValue = 10
    Mock.when(this.driver, 'limit').resolve(undefined)

    const queryBuilder = new QueryBuilder(this.driver, 'users')
    queryBuilder.limit(limitValue)

    assert.calledOnceWith(this.driver.limit, limitValue)
  }
}
