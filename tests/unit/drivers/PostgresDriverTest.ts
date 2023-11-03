/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Collection, Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { DriverFactory } from '#src/factories/DriverFactory'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, Mock, AfterEach, BeforeEach, type Context, Cleanup } from '@athenna/test'
import { NotConnectedDatabaseException } from '#src/exceptions/NotConnectedDatabaseException'

export default class PostgresDriverTest {
  public driver = new PostgresDriver('postgres-docker')

  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    this.driver.connect()
    await this.driver.dropDatabase('trx')
    await this.driver.dropTable('trx')
    await this.driver.dropTable('users')
    await this.driver.dropTable('orders')
    await this.driver.dropTable('products')
    await this.driver.dropTable('migrations')
    await this.driver.dropTable('migrations_lock')

    await this.driver.createTable('orders', builder => {
      builder.string('id').primary()
    })

    await this.driver.createTable('products', builder => {
      builder.string('id').primary()
      builder.integer('quantity').defaultTo(0)
    })

    await this.driver.createTable('users', builder => {
      builder.string('id').primary()
      builder.string('name')
    })
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()

    await this.driver.close()

    Config.clear()
  }

  @Test()
  public async shouldBeAbleToCloneTheDriverInstance({ assert }: Context) {
    const result = this.driver.clone()

    assert.notDeepEqual(result, this.driver)
    assert.instanceOf(result, PostgresDriver)
  }

  @Test()
  public async shouldBeAbleToGetTheClientOfTheDriver({ assert }: Context) {
    const result = this.driver.getClient()

    assert.isDefined(result.select)
    assert.isDefined(result.where)
  }

  @Test()
  public async shouldBeAbleToGetTheQueryBuilderOfTheDriver({ assert }: Context) {
    const result = this.driver.getQueryBuilder()

    assert.isDefined(result.select)
    assert.isDefined(result.where)
  }

  @Test()
  public async shouldBeAbleToSetDifferentQueryBuilderToDriver({ assert }: Context) {
    const query: any = {}

    this.driver.setQueryBuilder(query)

    assert.deepEqual(this.driver.getQueryBuilder(), query)
  }

  @Test()
  @Cleanup(() => DriverFactory.closeConnection('postgres-docker'))
  public async shouldBeAbleToConnectToDatabaseUsingPostgresDriver({ assert }: Context) {
    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect()

    assert.isTrue(driver.isConnected)
  }

  @Test()
  public async shouldBeAbleToConnectToDatabaseWithoutSavingConnectionInFactory({ assert }: Context) {
    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect({ saveOnFactory: false })

    assert.isTrue(driver.isConnected)
    assert.isFalse(DriverFactory.availableDrivers({ onlyConnected: true }).includes('postgres'))
  }

  @Test()
  public async shouldBeAbleToCallConnectMethodButWithoutConnectingToDatabase({ assert }: Context) {
    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect({ connect: false })

    assert.isFalse(driver.isConnected)
  }

  @Test()
  public async shouldNotReconnectToDatabaseIfIsAlreadyConnected({ assert }: Context) {
    Mock.spy(DriverFactory, 'createConnection')

    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect()
    assert.isTrue(driver.isConnected)

    driver.connect()

    assert.calledOnce(DriverFactory.createConnection)
  }

  @Test()
  @Cleanup(() => DriverFactory.closeAllConnections())
  public async shouldReconnectToDatabaseEvenIfIsAlreadyConnectedWhenForceIsSet({ assert }: Context) {
    Mock.spy(DriverFactory, 'createConnection')

    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect()
    assert.isTrue(driver.isConnected)

    driver.connect({ force: true })

    assert.calledTimes(DriverFactory.createConnection, 2)
  }

  @Test()
  @Cleanup(() => DriverFactory.closeAllConnections())
  public async shouldBeAbleToCloseTheConnectionWithDriver({ assert }: Context) {
    Mock.spy(DriverFactory, 'closeConnection')

    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect()
    driver.close()

    assert.calledOnce(DriverFactory.closeConnection)
  }

  @Test()
  public async shouldNotTryToCloseConnectionWithDriverIfConnectionIsClosed({ assert }: Context) {
    Mock.spy(DriverFactory, 'closeConnection')

    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.close()
    assert.notCalled(DriverFactory.closeConnection)
  }

  @Test()
  public async shouldBeAbleToCloseConnectionsThatAreNotSavedInTheDriverFactory({ assert }: Context) {
    await DriverFactory.closeAllConnections()

    const driver = new PostgresDriver('postgres-docker')

    assert.isFalse(driver.isConnected)

    driver.connect({ saveOnFactory: false })
    Mock.spy(driver.getClient(), 'destroy')

    driver.close()

    assert.calledOnce(driver.getClient().destroy)
  }

  @Test()
  public async shouldBeAbleToCreateQueryUsingDriverQueryBuilder({ assert }: Context) {
    const query = this.driver.query()

    assert.isDefined(query)
    assert.isDefined(query.select)
    assert.isDefined(query.where)
  }

  @Test()
  public async shouldThrowNotConnectedDatabaseExceptionIfTryingToCreateQueryWithConnectionClosed({ assert }: Context) {
    await this.driver.close()

    assert.throws(() => this.driver.query(), NotConnectedDatabaseException)
  }

  @Test()
  public async shouldBeAbleToCreateAndRollbackDatabaseTransactionsFromDriver({ assert }: Context) {
    const trx = await this.driver.startTransaction()

    await trx.createTable('trx', builder => {
      builder.string('id').primary()
    })

    assert.isTrue(await trx.hasTable('trx'))

    await trx.rollbackTransaction()

    assert.isFalse(await this.driver.hasTable('trx'))
  }

  @Test()
  public async shouldBeAbleToCreateAndCommitDatabaseTransactionsFromDriver({ assert }: Context) {
    const trx = await this.driver.startTransaction()

    await trx.createTable('trx', builder => {
      builder.string('id').primary()
    })

    assert.isTrue(await trx.hasTable('trx'))

    await trx.commitTransaction()

    assert.isTrue(await this.driver.hasTable('trx'))
  }

  @Test()
  public async shouldBeAbleToRunMigrationsUsingDriver({ assert }: Context) {
    await this.driver.dropTable('orders')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await this.driver.runMigrations()

    assert.isTrue(await this.driver.hasTable('orders'))
  }

  @Test()
  public async shouldBeAbleToRollbackMigrationsUsingDriver({ assert }: Context) {
    await this.driver.dropTable('orders')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await this.driver.runMigrations()

    assert.isTrue(await this.driver.hasTable('orders'))

    await this.driver.revertMigrations()

    assert.isFalse(await this.driver.hasTable('orders'))
  }

  @Test()
  public async shouldBeAbleToGetTheDatabasesOfDriver({ assert }: Context) {
    const databases = await this.driver.getDatabases()

    assert.deepEqual(databases, ['postgres', 'template1', 'template0'])
  }

  @Test()
  public async shouldBeAbleToGetTheCurrentDatabaseNameThatIsBeingUsed({ assert }: Context) {
    const database = await this.driver.getCurrentDatabase()

    assert.deepEqual(database, 'postgres')
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseExists({ assert }: Context) {
    const exists = await this.driver.hasDatabase('postgres')

    assert.isTrue(exists)
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseDoesNotExist({ assert }: Context) {
    const exists = await this.driver.hasDatabase('not-found')

    assert.isFalse(exists)
  }

  @Test()
  public async shouldBeAbleToCreateDatabaseUsingDriver({ assert }: Context) {
    await this.driver.createDatabase('trx')

    assert.isTrue(await this.driver.hasDatabase('trx'))
  }

  @Test()
  public async shouldNotThrowErrorsWhenCreatingADatabaseThatAlreadyExists({ assert }: Context) {
    await this.driver.createDatabase('trx')

    await assert.doesNotRejects(() => this.driver.createDatabase('trx'))
    assert.isTrue(await this.driver.hasDatabase('trx'))
  }

  @Test()
  public async shouldBeAbleToDropDatabaseUsingDriver({ assert }: Context) {
    await this.driver.createDatabase('trx')
    await this.driver.dropDatabase('trx')

    assert.isFalse(await this.driver.hasDatabase('trx'))
  }

  @Test()
  public async shouldNotThrowErrorsWhenDroppingADatabaseThatDoesNotExists({ assert }: Context) {
    await this.driver.dropDatabase('trx')

    await assert.doesNotRejects(() => this.driver.dropDatabase('trx'))
    assert.isFalse(await this.driver.hasDatabase('trx'))
  }

  @Test()
  public async shouldBeAbleToGetAllTheTablesFromDatabase({ assert }: Context) {
    const tables = await this.driver.getTables()

    assert.isTrue(tables.includes('orders'))
    assert.isTrue(tables.includes('products'))
    assert.isTrue(tables.includes('users'))
  }

  @Test()
  public async shouldBeAbleToGetAllTablesEvenRecentlyCreatedFromDatabase({ assert }: Context) {
    await this.driver.createTable('migrations', builder => {
      builder.string('id').primary()
    })

    const tables = await this.driver.getTables()

    assert.isTrue(tables.includes('migrations'))
    assert.isTrue(tables.includes('products'))
    assert.isTrue(tables.includes('orders'))
    assert.isTrue(tables.includes('users'))
  }

  @Test()
  public async shouldBeAbleToValidateThatATableExists({ assert }: Context) {
    await this.driver.createTable('migrations', builder => {
      builder.string('id').primary()
    })

    const exists = await this.driver.hasTable('migrations')

    assert.isTrue(exists)
  }

  @Test()
  public async shouldBeAbleToValidateThatATableDoesNotExists({ assert }: Context) {
    const exists = await this.driver.hasTable('migrations')

    assert.isFalse(exists)
  }

  @Test()
  public async shouldBeAbleToCreateTablesUsingDriver({ assert }: Context) {
    const exists = await this.driver.hasTable('orders')

    assert.isTrue(exists)
  }

  @Test()
  public async shouldBeAbleToDropTablesUsingDriver({ assert }: Context) {
    assert.isTrue(await this.driver.hasTable('orders'))

    await this.driver.dropTable('orders')

    assert.isFalse(await this.driver.hasTable('orders'))
  }

  @Test()
  public async shouldBeAbleToTruncateTheTableLeavingItClean({ assert }: Context) {
    const data = [{ id: '1' }, { id: '2' }, { id: '3' }]

    await this.driver.table('orders').createMany(data)
    const orders = await this.driver.table('orders').findMany()

    assert.deepEqual(orders, data)

    await this.driver.truncate('orders')

    assert.deepEqual(await this.driver.table('orders').findMany(), [])
  }

  @Test()
  public async shouldBeAbleToExecuteRawSQLQueriesWithDriver({ assert }: Context) {
    const result = await this.driver.raw('INSERT INTO orders ("id") VALUES (?), (?), (?) RETURNING *', ['1', '2', '3'])

    assert.deepEqual(result.command, 'INSERT')
    assert.deepEqual(result.rowCount, 3)
    assert.deepEqual(result.rows, [{ id: '1' }, { id: '2' }, { id: '3' }])
  }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').avg('quantity')

    assert.equal(result, 10)
  }

  @Test()
  public async shouldReturnNullWhenAvgCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').avg('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToGetTheAvgDistinctOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').avgDistinct('quantity')

    assert.equal(result, 10)
  }

  @Test()
  public async shouldReturnNullWhenAvgDistinctCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').avgDistinct('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToGetTheMaxNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 20 }
    ])

    const result = await this.driver.table('products').max('quantity')

    assert.equal(result, 20)
  }

  @Test()
  public async shouldReturnNullWhenMaxCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').max('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToGetTheMinNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 20 }
    ])

    const result = await this.driver.table('products').min('quantity')

    assert.equal(result, 10)
  }

  @Test()
  public async shouldReturnNullWhenMinCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').min('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToSumTheNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').sum('quantity')

    assert.equal(result, 20)
  }

  @Test()
  public async shouldReturnNullWhenSumCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').sum('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToIncrementTheNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    await this.driver.table('products').increment('quantity')
    const avg = await this.driver.table('products').avg('quantity')

    assert.equal(avg, 11)
  }

  @Test()
  public async shouldBeAbleToDecrementTheNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    await this.driver.table('products').decrement('quantity')
    const avg = await this.driver.table('products').avg('quantity')

    assert.equal(avg, 9)
  }

  @Test()
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').count()

    assert.equal(result, 2)
  }

  @Test()
  public async shouldBeAbleToCountColumnsValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').count('quantity')

    assert.equal(result, '2')
  }

  @Test()
  public async shouldBeAbleToCountDistinctColumnsValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { id: '1', quantity: 10 },
      { id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').countDistinct('quantity')

    assert.equal(result, '1')
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    const data = { id: '1', name: 'John Doe' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').findOrFail()

    assert.deepEqual(result, data)
  }

  @Test()
  public async shouldThrowNotFoundDataExceptionWhenFindOrFailFail({ assert }: Context) {
    await assert.rejects(() => this.driver.table('users').findOrFail(), NotFoundDataException)
  }

  @Test()
  public async shouldBeAbleToUseFindOrMethodToFindData({ assert }: Context) {
    const data = { id: '1', name: 'John Doe' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').findOr(() => {
      return { id: '1', name: 'Marie Curie' }
    })

    assert.deepEqual(result, data)
  }

  @Test()
  public async shouldBeAbleToReturnDataFromCallbackWhenFindOrFail({ assert }: Context) {
    const result = await this.driver.table('users').findOr(() => {
      return { id: '1', name: 'Marie Curie' }
    })

    assert.deepEqual(result, { id: '1', name: 'Marie Curie' })
  }

  @Test()
  public async shouldBeAbleToFindData({ assert }: Context) {
    const data = { id: '1', name: 'Charles Babbage' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').find()

    assert.deepEqual(result, data)
  }

  @Test()
  public async shouldReturnUndefinedWhenFindMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').find()

    assert.isUndefined(result)
  }

  @Test()
  public async shouldBeAbleToFindManyData({ assert }: Context) {
    const data = [{ id: '1', name: 'Charles Babbage' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').findMany()

    assert.deepEqual(result, data)
  }

  @Test()
  public async shouldReturnEmptyArrayWhenFindManyMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').findMany()

    assert.isEmpty(result)
  }

  @Test()
  public async shouldBeAbleToFindManyDataAndReturnAsCollection({ assert }: Context) {
    const data = [{ id: '1', name: 'Alan Turing' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').findMany()

    assert.deepEqual(result, data)
  }

  @Test()
  public async shouldReturnEmptyCollectionWhenCollectionMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').collection()

    assert.instanceOf(result, Collection)
  }

  //   @Test()
  //   public async shouldBeAbleToCreateData({ assert }: Context) {
  //     const dataToCreate = { name: 'New User' }
  //     const createdData = { id: '3', ...dataToCreate }
  //     Mock.when(FakeDriver, 'create').resolve(createdData)

  //     const result = await this.driver.create(dataToCreate)

  //     assert.calledOnceWith(FakeDriver.create, dataToCreate)
  //     assert.deepEqual(result, createdData)
  //   }

  //   @Test()
  //   public async shouldBeAbleToCreateManyData({ assert }: Context) {
  //     const dataToCreate = [{ name: 'User One' }, { name: 'User Two' }]
  //     const createdData = [
  //       { id: '4', ...dataToCreate[0] },
  //       { id: '5', ...dataToCreate[1] }
  //     ]
  //     Mock.when(FakeDriver, 'createMany').resolve(createdData)

  //     const result = await this.driver.createMany(dataToCreate)

  //     assert.calledOnceWith(FakeDriver.createMany, dataToCreate)
  //     assert.deepEqual(result, createdData)
  //   }

  //   @Test()
  //   public async shouldBeAbleToCreateOrUpdateData({ assert }: Context) {
  //     const dataToCreateOrUpdate = { id: '1', name: 'Updated User' }
  //     Mock.when(FakeDriver, 'createOrUpdate').resolve(dataToCreateOrUpdate)

  //     const result = await this.driver.createOrUpdate(dataToCreateOrUpdate)

  //     assert.calledOnceWith(FakeDriver.createOrUpdate, dataToCreateOrUpdate)
  //     assert.deepEqual(result, dataToCreateOrUpdate)
  //   }

  //   @Test()
  //   public async shouldBeAbleToUpdateData({ assert }: Context) {
  //     const dataToUpdate = { name: 'Updated User' }
  //     const updatedData = { id: '1', ...dataToUpdate }
  //     Mock.when(FakeDriver, 'update').resolve(updatedData)

  //     const result = await this.driver.update(dataToUpdate)

  //     assert.calledOnceWith(FakeDriver.update, dataToUpdate)
  //     assert.deepEqual(result, updatedData)
  //   }

  //   @Test()
  //   public async shouldBeAbleToDeleteData({ assert }: Context) {
  //     Mock.when(FakeDriver, 'delete').resolve(undefined)

  //     await this.driver.delete()

  //     assert.calledOnce(FakeDriver.delete)
  //   }

  //   @Test()
  //   public async shouldBeAbleToPerformARawQuery({ assert }: Context) {
  //     const sqlQuery = 'SELECT * FROM users WHERE id = ?'
  //     const bindings = [1]
  //     const expectedResult = [{ id: '1', name: 'John Doe' }]
  //     Mock.when(FakeDriver, 'raw').resolve(expectedResult)

  //     const result = await this.driver.raw(sqlQuery, bindings)

  //     assert.calledOnceWith(FakeDriver.raw, sqlQuery, bindings)
  //     assert.deepEqual(result, expectedResult)
  //   }

  //   @Test()
  //   public async shouldBeAbleToChangeTheTableOfTheQueryBuilder({ assert }: Context) {
  //     Mock.when(FakeDriver, 'table').resolve(undefined)

  //     this.driver.table('profiles')

  //     assert.calledWith(FakeDriver.table, 'profiles')
  //   }

  //   @Test()
  //   public async shouldExecuteTheGivenClosureWhenCriteriaIsTrue({ assert }: Context) {
  //     let called = false

  //     this.driver.when(true, () => {
  //       called = true
  //     })

  //     assert.isTrue(called)
  //   }

  //   @Test()
  //   public async shouldNotExecuteTheGivenClosureWhenCriteriaIsNotTrue({ assert }: Context) {
  //     let called = false

  //     this.driver.when(false, () => {
  //       called = true
  //     })

  //     assert.isFalse(called)
  //   }

  //   @Test()
  //   public async shouldBeAbleToDumpTheQueryCrafted({ assert }: Context) {
  //     Mock.when(FakeDriver, 'dump').resolve(undefined)

  //     this.driver.dump()

  //     assert.calledOnce(FakeDriver.dump)
  //   }

  //   @Test()
  //   public async shouldPaginateResultsAndReturnMetaDataForGivenPageAndLimit({ assert }: Context) {
  //     const page = 1
  //     const limit = 10
  //     const resourceUrl = '/users'
  //     const paginatedResult = { data: [], meta: { total: 0, perPage: limit, currentPage: page } }
  //     Mock.when(FakeDriver, 'paginate').resolve(paginatedResult)

  //     const result = await this.driver.paginate(page, limit, resourceUrl)

  //     assert.calledOnceWith(FakeDriver.paginate, page, limit, resourceUrl)
  //     assert.deepEqual(result, paginatedResult)
  //   }

  //   @Test()
  //   public async shouldAllowSelectingSpecificColumnsFromTable({ assert }: Context) {
  //     const columns = ['id', 'name']
  //     Mock.when(FakeDriver, 'select').resolve(undefined)

  //     this.driver.select(...columns)

  //     assert.calledOnceWith(FakeDriver.select, ...columns)
  //   }

  //   @Test()
  //   public async shouldAllowRawSqlSelectionForSpecializedQueries({ assert }: Context) {
  //     const sql = 'COUNT(*) as userCount'
  //     Mock.when(FakeDriver, 'selectRaw').resolve(undefined)

  //     this.driver.selectRaw(sql)

  //     assert.calledOnceWith(FakeDriver.selectRaw, sql)
  //   }

  //   @Test()
  //   public async shouldJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
  //     const tableName = 'posts'
  //     const column1 = 'users.id'
  //     const operation = '='
  //     const column2 = 'posts.user_id'
  //     Mock.when(FakeDriver, 'join').resolve(undefined)

  //     this.driver.join(tableName, column1, operation, column2)

  //     assert.calledOnceWith(FakeDriver.join, tableName, column1, operation, column2)
  //   }

  //   @Test()
  //   public async shouldApplyLeftJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'leftJoin').resolve(undefined)

  //     this.driver.leftJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.leftJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyRightJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'rightJoin').resolve(undefined)

  //     this.driver.rightJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.rightJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyCrossJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'crossJoin').resolve(undefined)

  //     this.driver.crossJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.crossJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyFullOuterJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'fullOuterJoin').resolve(undefined)

  //     this.driver.fullOuterJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.fullOuterJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyLeftOuterJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'leftOuterJoin').resolve(undefined)

  //     this.driver.leftOuterJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.leftOuterJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyRightOuterJoinForGivenTableAndConditions({ assert }: Context) {
  //     const table = 'profiles'
  //     const firstColumn = 'users.id'
  //     const secondColumn = 'profiles.user_id'
  //     Mock.when(FakeDriver, 'rightOuterJoin').resolve(undefined)

  //     this.driver.rightOuterJoin(table, firstColumn, secondColumn)

  //     assert.calledOnceWith(FakeDriver.rightOuterJoin, table, firstColumn, secondColumn)
  //   }

  //   @Test()
  //   public async shouldApplyJoinRawForGivenTableAndConditions({ assert }: Context) {
  //     const sql = 'NATURAL FULL JOIN users'
  //     Mock.when(FakeDriver, 'joinRaw').resolve(undefined)

  //     this.driver.joinRaw(sql)

  //     assert.calledOnceWith(FakeDriver.joinRaw, sql)
  //   }

  //   @Test()
  //   public async shouldAllowGroupingBySpecifiedColumns({ assert }: Context) {
  //     const columns = ['account_id']
  //     Mock.when(FakeDriver, 'groupBy').resolve(undefined)

  //     this.driver.groupBy(...columns)

  //     assert.calledOnceWith(FakeDriver.groupBy, ...columns)
  //   }

  //   @Test()
  //   public async shouldAllowGroupingBySpecifiedColumnsUsingGroupByRaw({ assert }: Context) {
  //     const sql = 'age WITH ROLLUP'
  //     Mock.when(FakeDriver, 'groupByRaw').resolve(undefined)

  //     this.driver.groupByRaw(sql)

  //     assert.calledOnceWith(FakeDriver.groupByRaw, sql)
  //   }

  //   @Test()
  //   public async shouldAddAHavingClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const operator = '>'
  //     const value = 100
  //     Mock.when(FakeDriver, 'having').resolve(undefined)

  //     this.driver.having(column, operator, value)

  //     assert.calledOnceWith(FakeDriver.having, column, operator, value)
  //   }

  //   @Test()
  //   public async shouldAddAHavingRawSQLClauseToTheQuery({ assert }: Context) {
  //     const sql = 'id > 100'
  //     Mock.when(FakeDriver, 'havingRaw').resolve(undefined)

  //     this.driver.havingRaw(sql)

  //     assert.calledOnceWith(FakeDriver.havingRaw, sql)
  //   }

  //   @Test()
  //   public async shouldAddAHavingExistsClauseToTheQuery({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'havingExists').resolve(undefined)

  //     this.driver.havingExists(closure)

  //     assert.calledOnce(FakeDriver.havingExists)
  //   }

  //   @Test()
  //   public async shouldAddAHavingNotExistsClauseToTheQuery({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'havingNotExists').resolve(undefined)

  //     this.driver.havingNotExists(closure)

  //     assert.calledOnce(FakeDriver.havingNotExists)
  //   }

  //   @Test()
  //   public async shouldAddAHavingInClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values = [1, 2, 3]
  //     Mock.when(FakeDriver, 'havingIn').resolve(undefined)

  //     this.driver.havingIn(column, values)

  //     assert.calledOnce(FakeDriver.havingIn)
  //   }

  //   @Test()
  //   public async shouldAddAHavingNotInClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values = [1, 2, 3]
  //     Mock.when(FakeDriver, 'havingNotIn').resolve(undefined)

  //     this.driver.havingNotIn(column, values)

  //     assert.calledOnce(FakeDriver.havingNotIn)
  //   }

  //   @Test()
  //   public async shouldAddAHavingBetweenClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values: [number, number] = [1, 3]
  //     Mock.when(FakeDriver, 'havingBetween').resolve(undefined)

  //     this.driver.havingBetween(column, values)

  //     assert.calledOnce(FakeDriver.havingBetween)
  //   }

  //   @Test()
  //   public async shouldAddAHavingNotBetweenClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values: [number, number] = [1, 3]
  //     Mock.when(FakeDriver, 'havingNotBetween').resolve(undefined)

  //     this.driver.havingNotBetween(column, values)

  //     assert.calledOnce(FakeDriver.havingNotBetween)
  //   }

  //   @Test()
  //   public async shouldAddAHavingNullClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     Mock.when(FakeDriver, 'havingNull').resolve(undefined)

  //     this.driver.havingNull(column)

  //     assert.calledOnce(FakeDriver.havingNull)
  //   }

  //   @Test()
  //   public async shouldAddAHavingNotNullClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     Mock.when(FakeDriver, 'havingNotNull').resolve(undefined)

  //     this.driver.havingNotNull(column)

  //     assert.calledOnce(FakeDriver.havingNotNull)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     Mock.when(FakeDriver, 'orHaving').resolve(undefined)

  //     this.driver.orHaving(column)

  //     assert.calledOnce(FakeDriver.orHaving)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingRawSQLClauseToTheQuery({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orHavingRaw').resolve(undefined)

  //     this.driver.orHavingRaw('age > 100')

  //     assert.calledOnce(FakeDriver.orHavingRaw)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingExistsClauseToTheQuery({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'orHavingExists').resolve(undefined)

  //     this.driver.orHavingExists(closure)

  //     assert.calledOnce(FakeDriver.orHavingExists)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingNotExistsClauseToTheQuery({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'orHavingNotExists').resolve(undefined)

  //     this.driver.orHavingNotExists(closure)

  //     assert.calledOnce(FakeDriver.orHavingNotExists)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingInClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values = [1, 2, 3]
  //     Mock.when(FakeDriver, 'orHavingIn').resolve(undefined)

  //     this.driver.orHavingIn(column, values)

  //     assert.calledOnce(FakeDriver.orHavingIn)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingNotInClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values = [1, 2, 3]
  //     Mock.when(FakeDriver, 'orHavingNotIn').resolve(undefined)

  //     this.driver.orHavingNotIn(column, values)

  //     assert.calledOnce(FakeDriver.orHavingNotIn)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingBetweenClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values: [number, number] = [1, 3]
  //     Mock.when(FakeDriver, 'orHavingBetween').resolve(undefined)

  //     this.driver.orHavingBetween(column, values)

  //     assert.calledOnce(FakeDriver.orHavingBetween)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingNotBetweenClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     const values: [number, number] = [1, 3]
  //     Mock.when(FakeDriver, 'orHavingNotBetween').resolve(undefined)

  //     this.driver.orHavingNotBetween(column, values)

  //     assert.calledOnce(FakeDriver.orHavingNotBetween)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingNullClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     Mock.when(FakeDriver, 'orHavingNull').resolve(undefined)

  //     this.driver.orHavingNull(column)

  //     assert.calledOnce(FakeDriver.orHavingNull)
  //   }

  //   @Test()
  //   public async shouldAddAnOrHavingNotNullClauseToTheQuery({ assert }: Context) {
  //     const column = 'id'
  //     Mock.when(FakeDriver, 'orHavingNotNull').resolve(undefined)

  //     this.driver.orHavingNotNull(column)

  //     assert.calledOnce(FakeDriver.orHavingNotNull)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereClause({ assert }: Context) {
  //     const column = 'age'
  //     const operation = '>'
  //     const value = 18
  //     Mock.when(FakeDriver, 'where').resolve(undefined)

  //     this.driver.where(column, operation, value)

  //     assert.calledOnceWith(FakeDriver.where, column, operation, value)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingRawWhereClauseForComplexConditions({ assert }: Context) {
  //     const sql = 'age > ? AND account_id IS NOT NULL'
  //     const bindings = [18]
  //     Mock.when(FakeDriver, 'whereRaw').resolve(undefined)

  //     this.driver.whereRaw(sql, ...bindings)

  //     assert.calledOnceWith(FakeDriver.whereRaw, sql, ...bindings)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNotClause({ assert }: Context) {
  //     const column = 'age'
  //     const value = 18
  //     Mock.when(FakeDriver, 'whereNot').resolve(undefined)

  //     this.driver.whereNot(column, value)

  //     assert.calledOnceWith(FakeDriver.whereNot, column, value)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereExistsClause({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'whereExists').resolve(undefined)

  //     this.driver.whereExists(closure)

  //     assert.calledOnce(FakeDriver.whereExists)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNotExistsClause({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'whereNotExists').resolve(undefined)

  //     this.driver.whereNotExists(closure)

  //     assert.calledOnce(FakeDriver.whereNotExists)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereLikeClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereLike').resolve(undefined)

  //     this.driver.whereLike('name', 'lenon')

  //     assert.calledOnceWith(FakeDriver.whereLike, 'name', 'lenon')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereILikeClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereILike').resolve(undefined)

  //     this.driver.whereILike('name', 'Lenon')

  //     assert.calledOnceWith(FakeDriver.whereILike, 'name', 'Lenon')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereInClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereIn').resolve(undefined)

  //     this.driver.whereIn('age', [1, 2, 3])

  //     assert.calledOnceWith(FakeDriver.whereIn, 'age', [1, 2, 3])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNoInClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereNotIn').resolve(undefined)

  //     this.driver.whereNotIn('age', [1, 2, 3])

  //     assert.calledOnceWith(FakeDriver.whereNotIn, 'age', [1, 2, 3])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereBetweenClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereBetween').resolve(undefined)

  //     this.driver.whereBetween('age', [1, 10])

  //     assert.calledOnceWith(FakeDriver.whereBetween, 'age', [1, 10])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNotBetweenClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereNotBetween').resolve(undefined)

  //     this.driver.whereNotBetween('age', [1, 10])

  //     assert.calledOnceWith(FakeDriver.whereNotBetween, 'age', [1, 10])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNullClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereNull').resolve(undefined)

  //     this.driver.whereNull('age')

  //     assert.calledOnceWith(FakeDriver.whereNull, 'age')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenWhereNotNullClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'whereNotNull').resolve(undefined)

  //     this.driver.whereNotNull('age')

  //     assert.calledOnceWith(FakeDriver.whereNotNull, 'age')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereClause({ assert }: Context) {
  //     const column = 'age'
  //     const operation = '>'
  //     const value = 18
  //     Mock.when(FakeDriver, 'orWhere').resolve(undefined)

  //     this.driver.orWhere(column, operation, value)

  //     assert.calledOnceWith(FakeDriver.orWhere, column, operation, value)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingRawOrWhereClauseForComplexConditions({ assert }: Context) {
  //     const sql = 'age > ? AND account_id IS NOT NULL'
  //     const bindings = [18]
  //     Mock.when(FakeDriver, 'orWhereRaw').resolve(undefined)

  //     this.driver.orWhereRaw(sql, ...bindings)

  //     assert.calledOnceWith(FakeDriver.orWhereRaw, sql, ...bindings)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNotClause({ assert }: Context) {
  //     const column = 'age'
  //     const value = 18
  //     Mock.when(FakeDriver, 'orWhereNot').resolve(undefined)

  //     this.driver.orWhereNot(column, value)

  //     assert.calledOnceWith(FakeDriver.orWhereNot, column, value)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereExistsClause({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'orWhereExists').resolve(undefined)

  //     this.driver.orWhereExists(closure)

  //     assert.calledOnce(FakeDriver.orWhereExists)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNotExistsClause({ assert }: Context) {
  //     const closure = query => {
  //       query.table('profiles').select('*').whereRaw('users.account_id = accounts.id')
  //     }
  //     Mock.when(FakeDriver, 'orWhereNotExists').resolve(undefined)

  //     this.driver.orWhereNotExists(closure)

  //     assert.calledOnce(FakeDriver.orWhereNotExists)
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereLikeClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereLike').resolve(undefined)

  //     this.driver.orWhereLike('name', 'lenon')

  //     assert.calledOnceWith(FakeDriver.orWhereLike, 'name', 'lenon')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereILikeClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereILike').resolve(undefined)

  //     this.driver.orWhereILike('name', 'Lenon')

  //     assert.calledOnceWith(FakeDriver.orWhereILike, 'name', 'Lenon')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereInClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereIn').resolve(undefined)

  //     this.driver.orWhereIn('age', [1, 2, 3])

  //     assert.calledOnceWith(FakeDriver.orWhereIn, 'age', [1, 2, 3])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNoInClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereNotIn').resolve(undefined)

  //     this.driver.orWhereNotIn('age', [1, 2, 3])

  //     assert.calledOnceWith(FakeDriver.orWhereNotIn, 'age', [1, 2, 3])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereBetweenClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereBetween').resolve(undefined)

  //     this.driver.orWhereBetween('age', [1, 10])

  //     assert.calledOnceWith(FakeDriver.orWhereBetween, 'age', [1, 10])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNotBetweenClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereNotBetween').resolve(undefined)

  //     this.driver.orWhereNotBetween('age', [1, 10])

  //     assert.calledOnceWith(FakeDriver.orWhereNotBetween, 'age', [1, 10])
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNullClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereNull').resolve(undefined)

  //     this.driver.orWhereNull('age')

  //     assert.calledOnceWith(FakeDriver.orWhereNull, 'age')
  //   }

  //   @Test()
  //   public async shouldFilterResultsUsingGivenOrWhereNotNullClause({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orWhereNotNull').resolve(undefined)

  //     this.driver.orWhereNotNull('age')

  //     assert.calledOnceWith(FakeDriver.orWhereNotNull, 'age')
  //   }

  //   @Test()
  //   public async shouldOrderBySpecifiedColumnInGivenDirection({ assert }: Context) {
  //     const column = 'name'
  //     const direction = 'ASC'
  //     Mock.when(FakeDriver, 'orderBy').resolve(undefined)

  //     this.driver.orderBy(column, direction)

  //     assert.calledOnceWith(FakeDriver.orderBy, column, direction)
  //   }

  //   @Test()
  //   public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
  //     Mock.when(FakeDriver, 'latest').resolve(undefined)

  //     this.driver.latest('createdAt')

  //     assert.calledOnceWith(FakeDriver.latest, 'createdAt')
  //   }

  //   @Test()
  //   public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
  //     Mock.when(FakeDriver, 'oldest').resolve(undefined)

  //     this.driver.oldest('createdAt')

  //     assert.calledOnceWith(FakeDriver.oldest, 'createdAt')
  //   }

  //   @Test()
  //   public async shouldOrderBySpecifiedColumnInGivenDirectionUsingRawSQL({ assert }: Context) {
  //     Mock.when(FakeDriver, 'orderByRaw').resolve(undefined)

  //     this.driver.orderByRaw('name DESC NULLS LAST')

  //     assert.calledOnceWith(FakeDriver.orderByRaw, 'name DESC NULLS LAST')
  //   }

  //   @Test()
  //   public async shouldOffsetTheResultsByGivenValue({ assert }: Context) {
  //     const offsetValue = 10
  //     Mock.when(FakeDriver, 'offset').resolve(undefined)

  //     this.driver.offset(offsetValue)

  //     assert.calledOnceWith(FakeDriver.offset, offsetValue)
  //   }

  //   @Test()
  //   public async shouldLimitTheNumberOfResultsReturned({ assert }: Context) {
  //     const limitValue = 10
  //     Mock.when(FakeDriver, 'limit').resolve(undefined)

  //     this.driver.limit(limitValue)

  //     assert.calledOnceWith(FakeDriver.limit, limitValue)
  //   }
}
