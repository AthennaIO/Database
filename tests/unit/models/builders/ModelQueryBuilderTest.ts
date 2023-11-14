/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { Model } from '#src/models/Model'
import { Database } from '#src/facades/Database'
import { Column } from '#src/models/annotations/Column'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, Mock, AfterEach, type Context, BeforeEach } from '@athenna/test'

class User extends Model {
  @Column()
  public id: string

  @Column()
  public name: string

  @Column()
  public score: number
}

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
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    const fakeCount = '42'
    Mock.when(FakeDriver, 'count').resolve(fakeCount)

    const queryBuilder = User.query()
    const result = await queryBuilder.count()

    assert.calledOnce(FakeDriver.count)
    assert.equal(result, fakeCount)
  }

  @Test()
  public async shouldBeAbleToCountDistinctRecords({ assert }: Context) {
    const fakeCountDistinct = '35'
    Mock.when(FakeDriver, 'countDistinct').resolve(fakeCountDistinct)

    const queryBuilder = User.query()
    const result = await queryBuilder.countDistinct('userId')

    assert.calledOnce(FakeDriver.countDistinct)
    assert.calledWith(FakeDriver.countDistinct, 'userId')
    assert.equal(result, fakeCountDistinct)
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    Mock.when(FakeDriver, 'find').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.findOrFail()

    assert.calledOnce(FakeDriver.find)
    assert.deepEqual(result, expectedData)
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
    const expectedData = { id: '1', name: 'John Doe' }
    const callback = async () => expectedData
    Mock.when(FakeDriver, 'findOr').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.findOr(callback)

    assert.calledOnceWith(FakeDriver.findOr, callback)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToFindData({ assert }: Context) {
    const expectedData = { id: '1', name: 'John Doe' }
    Mock.when(FakeDriver, 'find').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.find()

    assert.calledOnce(FakeDriver.find)
    assert.deepEqual(result, expectedData)
    assert.instanceOf(result, User)
  }

  @Test()
  public async shouldBeAbleToFindManyData({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(FakeDriver, 'findMany').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.findMany()

    assert.calledOnce(FakeDriver.findMany)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToFindManyDataUsingCollection({ assert }: Context) {
    const expectedData = [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Doe' }
    ]
    Mock.when(FakeDriver, 'collection').resolve(expectedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.collection()

    assert.calledOnce(FakeDriver.collection)
    assert.deepEqual(result, expectedData)
  }

  @Test()
  public async shouldBeAbleToCreateData({ assert }: Context) {
    const dataToCreate = { name: 'New User' }
    const createdData = { id: '3', ...dataToCreate }
    Mock.when(FakeDriver, 'create').resolve(createdData)

    const queryBuilder = User.query()
    const result = await queryBuilder.create(dataToCreate)

    assert.calledOnceWith(FakeDriver.create, dataToCreate)
    assert.deepEqual(result, createdData)
  }

  @Test()
  public async shouldBeAbleToCreateManyData({ assert }: Context) {
    const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
    const createdData = [
      { id: '4', ...dataToCreate[0] },
      { id: '5', ...dataToCreate[1] }
    ]
    Mock.when(FakeDriver, 'createMany').resolve(createdData)

    const queryBuilder = User.query()
    const result = await queryBuilder.createMany(dataToCreate)

    assert.calledOnceWith(FakeDriver.createMany, dataToCreate)
    assert.deepEqual(result, createdData)
  }

  @Test()
  public async shouldBeAbleToCreateOrUpdateData({ assert }: Context) {
    const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
    Mock.when(FakeDriver, 'createOrUpdate').resolve(dataToCreateOrUpdate)

    const queryBuilder = User.query()
    const result = await queryBuilder.createOrUpdate(dataToCreateOrUpdate)

    assert.calledOnceWith(FakeDriver.createOrUpdate, dataToCreateOrUpdate)
    assert.deepEqual(result, dataToCreateOrUpdate)
  }

  @Test()
  public async shouldBeAbleToUpdateData({ assert }: Context) {
    const dataToUpdate = { name: 'Updated User' }
    const updatedData = { id: '1', ...dataToUpdate }
    Mock.when(FakeDriver, 'update').resolve(updatedData)

    const queryBuilder = User.query()
    const result = await queryBuilder.update(dataToUpdate)

    assert.calledOnceWith(FakeDriver.update, dataToUpdate)
    assert.deepEqual(result, updatedData)
  }

  @Test()
  public async shouldBeAbleToDeleteData({ assert }: Context) {
    Mock.when(FakeDriver, 'delete').resolve(undefined)

    const queryBuilder = User.query()
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
    const columns = ['id', 'name']
    Mock.when(FakeDriver, 'select').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select(...columns)

    assert.calledOnceWith(FakeDriver.select, ...columns)
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
    const columns = ['id', 'name']
    Mock.when(FakeDriver, 'select').resolve(undefined)
    Mock.when(FakeDriver, 'from').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.select(...columns).from('users')

    assert.calledOnceWith(FakeDriver.select, ...columns)
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
    const columns = ['account_id']
    Mock.when(FakeDriver, 'groupBy').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.groupBy(...columns)

    assert.calledOnceWith(FakeDriver.groupBy, ...columns)
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
  public async shouldAddAHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'havingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotIn(column, values)

    assert.calledOnce(FakeDriver.havingNotIn)
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
  public async shouldAddAHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'havingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotBetween(column, values)

    assert.calledOnce(FakeDriver.havingNotBetween)
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
  public async shouldAddAHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'havingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.havingNotNull(column)

    assert.calledOnce(FakeDriver.havingNotNull)
  }

  @Test()
  public async shouldAddAnOrHavingClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'orHaving').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHaving(column)

    assert.calledOnce(FakeDriver.orHaving)
  }

  @Test()
  public async shouldAddAnOrHavingRawSQLClauseToTheQuery({ assert }: Context) {
    Mock.when(FakeDriver, 'orHavingRaw').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingRaw('age > 100')

    assert.calledOnce(FakeDriver.orHavingRaw)
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
  public async shouldAddAnOrHavingNotInClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values = [1, 2, 3]
    Mock.when(FakeDriver, 'orHavingNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotIn(column, values)

    assert.calledOnce(FakeDriver.orHavingNotIn)
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
  public async shouldAddAnOrHavingNotBetweenClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    const values: [number, number] = [1, 3]
    Mock.when(FakeDriver, 'orHavingNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotBetween(column, values)

    assert.calledOnce(FakeDriver.orHavingNotBetween)
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
  public async shouldAddAnOrHavingNotNullClauseToTheQuery({ assert }: Context) {
    const column = 'id'
    Mock.when(FakeDriver, 'orHavingNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orHavingNotNull(column)

    assert.calledOnce(FakeDriver.orHavingNotNull)
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereClause({ assert }: Context) {
    const column = 'age'
    const operation = '>'
    const value = 18
    Mock.when(FakeDriver, 'where').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.where(column, operation, value)

    assert.calledOnceWith(FakeDriver.where, column, operation, value)
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
    const column = 'age'
    const value = 18
    Mock.when(FakeDriver, 'whereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNot(column, value)

    assert.calledOnceWith(FakeDriver.whereNot, column, value)
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
  public async shouldFilterResultsUsingGivenWhereILikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereILike('name', 'Lenon')

    assert.calledOnceWith(FakeDriver.whereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereIn('age', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNoInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotIn('age', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.whereNotIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereBetween('age', [1, 10])

    assert.calledOnceWith(FakeDriver.whereBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotBetween('age', [1, 10])

    assert.calledOnceWith(FakeDriver.whereNotBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNull('age')

    assert.calledOnceWith(FakeDriver.whereNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenWhereNotNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'whereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.whereNotNull('age')

    assert.calledOnceWith(FakeDriver.whereNotNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereClause({ assert }: Context) {
    const column = 'age'
    const operation = '>'
    const value = 18
    Mock.when(FakeDriver, 'orWhere').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhere(column, operation, value)

    assert.calledOnceWith(FakeDriver.orWhere, column, operation, value)
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
    const column = 'age'
    const value = 18
    Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNot(column, value)

    assert.calledOnceWith(FakeDriver.orWhereNot, column, value)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
    }
    Mock.when(FakeDriver, 'orWhereExists').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereExists(closure)

    assert.calledOnce(FakeDriver.orWhereExists)
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotExistsClause({ assert }: Context) {
    const closure = query => {
      query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
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
  public async shouldFilterResultsUsingGivenOrWhereILikeClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereILike('name', 'Lenon')

    assert.calledOnceWith(FakeDriver.orWhereILike, 'name', 'Lenon')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereIn('age', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNoInClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotIn').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotIn('age', [1, 2, 3])

    assert.calledOnceWith(FakeDriver.orWhereNotIn, 'age', [1, 2, 3])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereBetween('age', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotBetweenClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotBetween').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotBetween('age', [1, 10])

    assert.calledOnceWith(FakeDriver.orWhereNotBetween, 'age', [1, 10])
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNull('age')

    assert.calledOnceWith(FakeDriver.orWhereNull, 'age')
  }

  @Test()
  public async shouldFilterResultsUsingGivenOrWhereNotNullClause({ assert }: Context) {
    Mock.when(FakeDriver, 'orWhereNotNull').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.orWhereNotNull('age')

    assert.calledOnceWith(FakeDriver.orWhereNotNull, 'age')
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
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
    Mock.when(FakeDriver, 'latest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.latest('createdAt')

    assert.calledOnceWith(FakeDriver.latest, 'createdAt')
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
    Mock.when(FakeDriver, 'oldest').resolve(undefined)

    const queryBuilder = User.query()
    queryBuilder.oldest('createdAt')

    assert.calledOnceWith(FakeDriver.oldest, 'createdAt')
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
