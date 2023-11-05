/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Collection, Path } from '@athenna/common'
import { MongoDriver } from '#src/drivers/MongoDriver'
import { DriverFactory } from '#src/factories/DriverFactory'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/exceptions/NotFoundDataException'
import { Test, Mock, AfterEach, BeforeEach, type Context, Cleanup } from '@athenna/test'
import { NotConnectedDatabaseException } from '#src/exceptions/NotConnectedDatabaseException'

export default class MongoDriverTest {
  public driver = new MongoDriver('mongo-memory')

  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    this.driver.connect()
    await this.driver.dropDatabase('trx')
    await this.driver.dropTable('trx')
    await this.driver.dropTable('rents')
    await this.driver.dropTable('students_courses')
    await this.driver.dropTable('students')
    await this.driver.dropTable('courses')
    await this.driver.dropTable('product_details')
    await this.driver.dropTable('products')
    await this.driver.dropTable('users')
    await this.driver.dropTable('orders')
    await this.driver.dropTable('migrations')
    await this.driver.dropTable('migrations_lock')
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
    assert.instanceOf(result, MongoDriver)
  }

  @Test()
  public async shouldBeAbleToGetTheClientOfTheDriver({ assert }: Context) {
    const result = this.driver.getClient()

    assert.isDefined(result.collection)
    assert.isDefined(result.collections)
  }

  @Test()
  public async shouldBeAbleToGetTheQueryBuilderOfTheDriver({ assert }: Context) {
    const result = this.driver.getQueryBuilder()

    assert.isDefined(result.name)
    assert.isDefined(result.collectionName)
  }

  @Test()
  public async shouldBeAbleToSetDifferentQueryBuilderToDriver({ assert }: Context) {
    const query: any = {}

    this.driver.setQueryBuilder(query)

    assert.deepEqual(this.driver.getQueryBuilder(), query)
  }

  @Test()
  public async shouldBeAbleToConnectToDatabaseUsingMongoDriver({ assert }: Context) {
    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect()

    assert.isTrue(driver.isConnected)
  }

  @Test()
  public async shouldBeAbleToConnectToDatabaseWithoutSavingConnectionInFactory({ assert }: Context) {
    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect({ saveOnFactory: false })

    assert.isTrue(driver.isConnected)
    assert.isFalse(DriverFactory.availableDrivers({ onlyConnected: true }).includes('admin'))
  }

  @Test()
  public async shouldBeAbleToCallConnectMethodButWithoutConnectingToDatabase({ assert }: Context) {
    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect({ connect: false })

    assert.isFalse(driver.isConnected)
  }

  @Test()
  public async shouldNotReconnectToDatabaseIfIsAlreadyConnected({ assert }: Context) {
    Mock.spy(ConnectionFactory, 'mongo')

    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect()
    assert.isTrue(driver.isConnected)

    driver.connect()

    assert.calledOnce(ConnectionFactory.mongo)
  }

  @Test()
  @Cleanup(() => ConnectionFactory.closeAllConnections())
  public async shouldReconnectToDatabaseEvenIfIsAlreadyConnectedWhenForceIsSet({ assert }: Context) {
    Mock.spy(ConnectionFactory, 'mongo')

    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect()
    assert.isTrue(driver.isConnected)

    driver.connect({ force: true })

    assert.calledTimes(ConnectionFactory.mongo, 2)
  }

  @Test()
  @Cleanup(() => ConnectionFactory.closeAllConnections())
  public async shouldBeAbleToCloseTheConnectionWithDriver({ assert }: Context) {
    Mock.spy(ConnectionFactory, 'closeByDriver')

    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect()
    await driver.close()

    assert.calledOnce(ConnectionFactory.closeByDriver)
  }

  @Test()
  public async shouldNotTryToCloseConnectionWithDriverIfConnectionIsClosed({ assert }: Context) {
    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    Mock.spy(DriverFactory, 'getClient')

    assert.isFalse(driver.isConnected)

    await driver.close()

    assert.notCalled(DriverFactory.getClient)
  }

  @Test()
  public async shouldBeAbleToCloseConnectionsThatAreNotSavedInTheDriverFactory({ assert }: Context) {
    await ConnectionFactory.closeAllConnections()

    const driver = new MongoDriver('mongo-memory')

    assert.isFalse(driver.isConnected)

    driver.connect({ saveOnFactory: false })

    await driver.close()

    assert.isNull(driver.client)
  }

  @Test()
  public async shouldBeAbleToCreateQueryUsingDriverQueryBuilder({ assert }: Context) {
    const query = this.driver.query()

    assert.isDefined(query)
    assert.isDefined(query.name)
    assert.isDefined(query.collectionName)
  }

  @Test()
  public async shouldThrowNotConnectedDatabaseExceptionIfTryingToCreateQueryWithConnectionClosed({ assert }: Context) {
    await this.driver.close()

    assert.throws(() => this.driver.query(), NotConnectedDatabaseException)
  }

  @Test()
  public async shouldBeAbleToCreateAndRollbackDatabaseTransactionsFromDriver({ assert }: Context) {
    const trx = await this.driver.startTransaction()
    const query = trx.table('users')
    const data = await query.create({ _id: '1', name: 'Lenon' })

    assert.deepEqual(data, await query.where('_id', '1').find())

    await trx.rollbackTransaction()

    assert.isUndefined(await this.driver.table('users').where('_id', '1').find())
  }

  @Test()
  public async shouldBeAbleToCreateAndCommitDatabaseTransactionsFromDriver({ assert }: Context) {
    const trx = await this.driver.startTransaction()
    const query = trx.table('users')
    const data = await query.create({ _id: '1', name: 'Lenon' })

    assert.deepEqual(data, await query.where('_id', '1').find())

    await trx.commitTransaction()

    assert.isDefined(await this.driver.table('users').where('_id', '1').find())
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToRunMigrationsUsingDriver({ assert }: Context) {
  //   await this.driver.dropTable('rents')
  //   await this.driver.dropTable('products')
  //   await this.driver.dropTable('users')

  //   Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

  //   await this.driver.runMigrations()

  //   assert.isTrue(await this.driver.hasTable('users'))
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToRollbackMigrationsUsingDriver({ assert }: Context) {
  //   await this.driver.dropTable('rents')
  //   await this.driver.dropTable('products')
  //   await this.driver.dropTable('users')

  //   Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

  //   await this.driver.runMigrations()

  //   assert.isTrue(await this.driver.hasTable('users'))

  //   await this.driver.revertMigrations()

  //   assert.isFalse(await this.driver.hasTable('users'))
  // }

  @Test()
  public async shouldBeAbleToGetTheDatabasesOfDriver({ assert }: Context) {
    const databases = await this.driver.getDatabases()

    assert.deepEqual(databases, ['admin', 'config', 'local'])
  }

  @Test()
  public async shouldBeAbleToGetTheCurrentDatabaseNameThatIsBeingUsed({ assert }: Context) {
    const database = await this.driver.getCurrentDatabase()

    assert.deepEqual(database, 'admin')
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseExists({ assert }: Context) {
    const exists = await this.driver.hasDatabase('admin')

    assert.isTrue(exists)
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseDoesNotExist({ assert }: Context) {
    const exists = await this.driver.hasDatabase('not-found')

    assert.isFalse(exists)
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToCreateDatabaseUsingDriver({ assert }: Context) {
  //   await this.driver.createDatabase('trx')

  //   assert.isTrue(await this.driver.hasDatabase('trx'))
  // }

  @Test()
  public async shouldBeAbleToDropDatabaseUsingDriver({ assert }: Context) {
    // TODO How to create?
    // await this.driver.createDatabase('trx')
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
    await this.driver.client.createCollection('orders')
    await this.driver.client.createCollection('products')
    await this.driver.client.createCollection('users')

    const tables = await this.driver.getTables()

    assert.isTrue(tables.includes('orders'))
    assert.isTrue(tables.includes('products'))
    assert.isTrue(tables.includes('users'))
  }

  @Test()
  public async shouldBeAbleToValidateThatATableExists({ assert }: Context) {
    await this.driver.client.createCollection('orders')

    const exists = await this.driver.hasTable('orders')

    assert.isTrue(exists)
  }

  @Test()
  public async shouldBeAbleToValidateThatATableDoesNotExists({ assert }: Context) {
    const exists = await this.driver.hasTable('not-found')

    assert.isFalse(exists)
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToCreateTablesUsingDriver({ assert }: Context) {
  //   const exists = await this.driver.hasTable('orders')

  //   assert.isTrue(exists)
  // }

  @Test()
  public async shouldBeAbleToDropTablesUsingDriver({ assert }: Context) {
    await this.driver.client.createCollection('orders')

    assert.isTrue(await this.driver.hasTable('orders'))

    await this.driver.dropTable('orders')

    assert.isFalse(await this.driver.hasTable('orders'))
  }

  @Test()
  public async shouldBeAbleToTruncateTheTableLeavingItClean({ assert }: Context) {
    const data = [{ _id: '1' }, { _id: '2' }, { _id: '3' }]

    await this.driver.table('orders').createMany(data)
    const orders = await this.driver.table('orders').findMany()

    assert.deepEqual(orders, data)

    await this.driver.truncate('orders')

    assert.deepEqual(await this.driver.table('orders').findMany(), [])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToExecuteRawSQLQueriesWithDriver({ assert }: Context) {
  //   const result = await this.driver.raw('INSERT INTO orders ("id") VALUES (?), (?), (?) RETURNING *', ['1', '2', '3'])

  //   assert.deepEqual(result.command, 'INSERT')
  //   assert.deepEqual(result.rowCount, 3)
  //   assert.deepEqual(result.rows, [{ _id: '1' }, { _id: '2' }, { _id: '3' }])
  // }

  @Test()
  public async shouldBeAbleToGetTheAvgOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
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
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
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
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 20 }
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
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 20 }
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
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
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
  public async shouldBeAbleToGetTheSumDistinctOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').sumDistinct('quantity')

    assert.equal(result, 10)
  }

  @Test()
  public async shouldReturnNullWhenSumDistinctCantFindAnyValue({ assert }: Context) {
    const result = await this.driver.table('products').sumDistinct('quantity')

    assert.isNull(result)
  }

  @Test()
  public async shouldBeAbleToIncrementTheNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    await this.driver.table('products').increment('quantity')
    const avg = await this.driver.table('products').avg('quantity')

    assert.equal(avg, 11)
  }

  @Test()
  public async shouldBeAbleToDecrementTheNumberOfAGivenColumnWhenTableGotValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    await this.driver.table('products').decrement('quantity')
    const avg = await this.driver.table('products').avg('quantity')

    assert.equal(avg, 9)
  }

  @Test()
  public async shouldBeAbleToCountRecords({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').count()

    assert.equal(result, 2)
  }

  @Test()
  public async shouldBeAbleToCountColumnsValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').count('quantity')

    assert.equal(result, '2')
  }

  @Test()
  public async shouldBeAbleToCountDistinctColumnsValues({ assert }: Context) {
    await this.driver.table('products').createMany([
      { _id: '1', quantity: 10 },
      { _id: '2', quantity: 10 }
    ])

    const result = await this.driver.table('products').countDistinct('quantity')

    assert.equal(result, '1')
  }

  @Test()
  public async shouldBeAbleToFindDataUsingFindOrFail({ assert }: Context) {
    const data = { _id: '1', name: 'John Doe' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').findOrFail()

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldThrowNotFoundDataExceptionWhenFindOrFailFail({ assert }: Context) {
    await assert.rejects(() => this.driver.table('users').findOrFail(), NotFoundDataException)
  }

  @Test()
  public async shouldBeAbleToUseFindOrMethodToFindData({ assert }: Context) {
    const data = { _id: '1', name: 'John Doe' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').findOr(() => {
      return { _id: '1', name: 'Marie Curie' }
    })

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldBeAbleToReturnDataFromCallbackWhenFindOrFail({ assert }: Context) {
    const result = await this.driver.table('users').findOr(() => {
      return { _id: '1', name: 'Marie Curie' }
    })

    assert.deepEqual(result, { _id: '1', name: 'Marie Curie' })
  }

  @Test()
  public async shouldBeAbleToExecuteSomeClosureWhenCriteriaIsTrue({ assert }: Context) {
    const data = { _id: '1', name: 'Marie Curie' }
    await this.driver.table('users').create(data)

    const result = await this.driver
      .when(true, query => {
        query.select('name')
      })
      .find()

    assert.deepEqual(result, { name: 'Marie Curie' })
  }

  @Test()
  public async shouldNotExecuteSomeClosureWhenCriteriaIsFalse({ assert }: Context) {
    const data = { _id: '1', name: 'Marie Curie' }
    await this.driver.table('users').create(data)

    const result = await this.driver
      .when(false, query => {
        query.select('*')
      })
      .find()

    assert.containsSubset(result, { _id: '1', name: 'Marie Curie' })
  }

  @Test()
  public async shouldBeAbleToFindDataUsingDriver({ assert }: Context) {
    const data = { _id: '1', name: 'Charles Babbage' }
    await this.driver.table('users').create(data)

    const result = await this.driver.table('users').find()

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldReturnUndefinedWhenFindMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').find()

    assert.isUndefined(result)
  }

  @Test()
  public async shouldBeAbleToFindManyDataUsingDriver({ assert }: Context) {
    const data = [{ _id: '1', name: 'Charles Babbage' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').findMany()

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldReturnEmptyArrayWhenFindManyMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').findMany()

    assert.isEmpty(result)
  }

  @Test()
  public async shouldBeAbleToFindManyDataAndReturnAsCollectionUsingDriver({ assert }: Context) {
    const data = [{ _id: '1', name: 'Alan Turing' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').findMany()

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldReturnEmptyCollectionWhenCollectionMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').collection()

    assert.instanceOf(result, Collection)
  }

  @Test()
  public async shouldBeAbleToFindManyDataAndReturnPaginatedUsingDriver({ assert }: Context) {
    const data = [{ _id: '1', name: 'Alan Turing' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').paginate()

    assert.containsSubset(result.data, data)
    assert.deepEqual(result.meta, {
      currentPage: 0,
      itemCount: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1
    })
    assert.deepEqual(result.links, {
      first: '/?limit=10',
      last: '/?page=1&limit=10',
      next: '/?page=1&limit=10',
      previous: '/?page=0&limit=10'
    })
  }

  @Test()
  public async shouldBeAbleToSetDifferentUrlToFindManyDataAndReturnPaginatedUsingDriver({ assert }: Context) {
    const data = [{ _id: '1', name: 'Alan Turing' }]
    await this.driver.table('users').createMany(data)

    const result = await this.driver.table('users').paginate(0, 10, '/users')

    assert.containsSubset(result.data, data)
    assert.deepEqual(result.meta, {
      currentPage: 0,
      itemCount: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1
    })
    assert.deepEqual(result.links, {
      first: '/users?limit=10',
      last: '/users?page=1&limit=10',
      next: '/users?page=1&limit=10',
      previous: '/users?page=0&limit=10'
    })
  }

  @Test()
  public async shouldReturnEmptyDataWhenPaginateMethodCantFindNothing({ assert }: Context) {
    const result = await this.driver.table('users').paginate()

    assert.isEmpty(result.data)
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingDriver({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    const result = await this.driver.table('users').create(data)

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldThrowWrongMethodExceptionWhenCallingCreateWithObject({ assert }: Context) {
    await assert.rejects(
      () => this.driver.table('users').create([{ _id: '1', name: 'Robert Kiyosaki' }] as any),
      WrongMethodException
    )
  }

  @Test()
  public async shouldBeAbleToCreateManyDataUsingDriver({ assert }: Context) {
    const data = [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ]

    const result = await this.driver.table('users').createMany(data)

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldThrowWrongMethodExceptionWhenCallingCreateManyWithObject({ assert }: Context) {
    await assert.rejects(
      () => this.driver.table('users').createMany({ _id: '1', name: 'Robert Kiyosaki' } as any),
      WrongMethodException
    )
  }

  @Test()
  public async shouldBeAbleToCreateDataUsingCreateOrUpdateMethod({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    const result = await this.driver.table('users').createOrUpdate(data)

    assert.containsSubset(result, data)
  }

  @Test()
  public async shouldBeAbleToUpdateDataUsingCreateOrUpdateMethod({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    await this.driver.table('users').create(data)
    const result = await this.driver.table('users').createOrUpdate({ ...data, name: 'Robert Kiyosaki Millennials' })

    assert.containsSubset(result, { ...data, name: 'Robert Kiyosaki Millennials' })
  }

  @Test()
  public async shouldBeAbleToUpdateSingleDataAndReturnSingleObject({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    await this.driver.table('users').create(data)
    const result = await this.driver.table('users').update({ ...data, name: 'Robert Kiyosaki Millennials' })

    assert.containsSubset(result, { ...data, name: 'Robert Kiyosaki Millennials' })
  }

  @Test()
  public async shouldBeAbleToUpdateMultipleDataAndReturnAnArrayOfObjects({ assert }: Context) {
    const data = [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ]

    await this.driver.table('users').createMany(data)
    const result = await this.driver
      .table('users')
      .whereIn('_id', ['1', '2'])
      .update({ name: 'Robert Kiyosaki Millennials' })

    assert.containsSubset(result, [
      { _id: '1', name: 'Robert Kiyosaki Millennials' },
      { _id: '2', name: 'Robert Kiyosaki Millennials' }
    ])
  }

  @Test()
  public async shouldBeAbleToDeleteDataUsingDeleteMethod({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    await this.driver.table('users').create(data)
    await this.driver.table('users').where('_id', '1').delete()

    assert.isUndefined(await this.driver.table('users').where('_id', '1').find())
  }

  @Test()
  public async shouldBeAbleToChangeInWhichTableTheDriverWillPerformTheOperations({ assert }: Context) {
    const data = { _id: '1', name: 'Robert Kiyosaki' }

    await this.driver.table('users').create(data)

    assert.deepEqual(await this.driver.table('users').count(), '1')
  }

  @Test()
  public async shouldThrowNotConnectedDatabaseExceptionWhenTryingToChangeTable({ assert }: Context) {
    await this.driver.close()

    await assert.rejects(() => this.driver.table('users'), NotConnectedDatabaseException)
  }

  @Test()
  public async shouldBeAbleToDumpTheSQLQuery({ assert }: Context) {
    Mock.when(console, 'log').return(undefined)

    this.driver.table('users').select('*').dump()

    assert.calledWith(console.log, { where: {}, orWhere: [], pipeline: [] })
  }

  @Test()
  public async shouldAllowSelectingSpecificColumnsFromTable({ assert }: Context) {
    await this.driver.table('users').create({ _id: '1', name: 'Alan Turing' })

    const data = await this.driver.table('users').select('_id', 'name').where('_id', '1').findMany()

    assert.deepEqual(data, [{ _id: '1', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldAllowSelectingAllColumnsFromTable({ assert }: Context) {
    await this.driver.table('users').create({ _id: '1', name: 'Alan Turing' })

    const data = await this.driver.table('users').select('*').where('_id', '1').findMany()

    assert.containsSubset(data, [{ _id: '1', name: 'Alan Turing' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldAllowRawSqlSelectionForSpecializedQueries({ assert }: Context) {
  //   await this.driver.table('users').create({ _id: '1', name: 'Alan Turing' })

  //   const data = await this.driver.table('users').selectRaw('COUNT(*) as user_count').find()

  //   assert.deepEqual(data, { user_count: '1' })
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldAllowSelectingAllColumnsFromTableUsingFrom({ assert }: Context) {
  //   await this.driver.table('users').create({ _id: '1', name: 'Alan Turing' })

  //   const data = await this.driver.select('*').from('users').where('_id', '1').findMany()

  //   assert.containsSubset(data, [{ _id: '1', name: 'Alan Turing' }])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldAllowRawSqlSelectionForSpecializedQueriesUsingFromRaw({ assert }: Context) {
  //   await this.driver.table('users').create({ _id: '1', name: 'Alan Turing' })

  //   const data = await this.driver.selectRaw('COUNT(*) as user_count').fromRaw('users').find()

  //   assert.deepEqual(data, { user_count: '1' })
  // }

  @Test()
  public async shouldBeAbleToJoinAnotherTableBasedOnSpecifiedColumns({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .join('rents', 'users.id', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .join('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToLeftJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .leftJoin('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToRightJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .rightJoin('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToCrossJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .crossJoin('rents')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToFullOuterJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .fullOuterJoin('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToLeftOuterJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .leftOuterJoin('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  @Test()
  public async shouldBeAbleToRightOuterJoinAnotherTableBasedOnSpecifiedColumnsAndOperation({ assert }: Context) {
    await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' }
    ])

    const data = await this.driver
      .table('users')
      .select('users.id as user_id')
      .select('users.name as user_name')
      .select('rents.id as rent_id')
      .rightOuterJoin('rents', 'users.id', '=', 'rents.user_id')
      .findMany()

    assert.deepEqual(data, [
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '2' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '3' },
      { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '4' }
    ])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldApplyJoinRawForGivenTableAndConditions({ assert }: Context) {
  //   await this.driver.table('users').createMany([{ _id: '1', name: 'Robert Kiyosaki' }])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' }
  //   ])

  //   const data = await this.driver
  //     .table('users')
  //     .select('users.id as user_id')
  //     .select('users.name as user_name')
  //     .select('rents.id as rent_id')
  //     .joinRaw('NATURAL FULL JOIN rents')
  //     .findMany()

  //   assert.deepEqual(data, [
  //     { user_id: '1', user_name: 'Robert Kiyosaki', rent_id: '1' },
  //     { user_id: null, user_name: null, rent_id: '4' },
  //     { user_id: null, user_name: null, rent_id: '3' },
  //     { user_id: null, user_name: null, rent_id: '2' }
  //   ])
  // }

  @Test()
  public async shouldBeAbleToGroupBySpecifiedColumnsUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('rents').select('user_id').groupBy('user_id').orderBy('user_id').findMany()

    assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToGroupByRawSpecifiedColumnsUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver.table('rents').select('user_id').groupByRaw('user_id ORDER BY user_id').findMany()

  //   assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  // }

  @Test()
  public async shouldBeAbleToAddAHavingClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .groupBy('user_id')
      .having('user_id', '<=', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAHavingClauseWithDefaultEqualOpToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .groupBy('user_id')
      .having('user_id', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAHavingRawClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .select('user_id')
  //     .groupBy('user_id')
  //     .havingRaw("user_id <= '2' ORDER BY user_id")
  //     .findMany()

  //   assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAHavingExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .groupBy('_id', 'user_id')
  //     .havingExists(query => {
  //       query.select(query.raw('1')).from('users').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [
  //     { _id: '6', user_id: '2' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '1', user_id: '1' },
  //     { _id: '3', user_id: '1' }
  //   ])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAHavingNotExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' },
  //     { _id: '3', name: 'Alan Turing' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('users')
  //     .select('_id', 'name')
  //     .groupBy('_id', 'name')
  //     .havingNotExists(query => {
  //       query.select(query.raw('1')).from('rents').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  // }

  @Test()
  public async shouldBeAbleToAddAHavingInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .havingIn('name', ['Alan Turing'])
      .findMany()

    assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAHavingNotInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').groupBy('_id', 'name').havingNotIn('_id', ['1', '2']).findMany()

    assert.containsSubset(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAHavingBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').groupBy('_id', 'name').havingBetween('_id', ['1', '3']).findMany()

    assert.containsSubset(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAHavingNotBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').groupBy('_id', 'name').havingNotBetween('_id', ['1', '3']).findMany()

    assert.isEmpty(data)
  }

  @Test()
  public async shouldBeAbleToAddAHavingNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .havingNull('name')
      .findMany()

    assert.deepEqual(data, [{ _id: '4', name: null }])
  }

  @Test()
  public async shouldBeAbleToAddAHavingNotNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .havingNotNull('name')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .groupBy('user_id')
      .orHaving('user_id', '<=', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingClauseWithDefaultEqualOpToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .groupBy('user_id')
      .orHaving('user_id', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrHavingRawClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .select('user_id')
  //     .groupBy('user_id')
  //     .orHavingRaw("user_id <= '2' ORDER BY user_id")
  //     .findMany()

  //   assert.deepEqual(data, [{ user_id: '1' }, { user_id: '2' }])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrHavingExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .groupBy('_id', 'user_id')
  //     .orHavingExists(query => {
  //       query.select(query.raw('1')).from('users').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [
  //     { _id: '6', user_id: '2' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '1', user_id: '1' },
  //     { _id: '3', user_id: '1' }
  //   ])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrHavingNotExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' },
  //     { _id: '3', name: 'Alan Turing' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('users')
  //     .select('_id', 'name')
  //     .groupBy('_id', 'name')
  //     .orHavingNotExists(query => {
  //       query.select(query.raw('1')).from('rents').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  // }

  @Test()
  public async shouldBeAbleToAddAOrHavingInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .orHavingIn('name', ['Alan Turing'])
      .findMany()

    assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingNotInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').groupBy('_id', 'name').orHavingNotIn('_id', ['1', '2']).findMany()

    assert.containsSubset(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').groupBy('_id', 'name').orHavingBetween('_id', ['1', '3']).findMany()

    assert.containsSubset(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingNotBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .groupBy('_id', 'name')
      .orHavingNotBetween('_id', ['1', '3'])
      .findMany()

    assert.isEmpty(data)
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .orHavingNull('name')
      .findMany()

    assert.deepEqual(data, [{ _id: '4', name: null }])
  }

  @Test()
  public async shouldBeAbleToAddAOrHavingNotNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .groupBy('_id', 'name')
      .orHavingNotNull('name')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAWhereClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .where('user_id', '=', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereClauseWithDefaultEqualOpToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('rents').select('user_id').where('user_id', '2').orderBy('user_id').findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereClauseAsClosureToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .where(query => {
        query.whereIn('user_id', ['2'])
      })
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAWhereRawClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver.table('rents').select('user_id').whereRaw("user_id = '2'").findMany()

  //   assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  // }

  @Test()
  public async shouldBeAbleToAddAWhereNotClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .whereNot('user_id', '1')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereNotClauseAsFunctionToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .whereNot(query => {
        query.whereIn('user_id', ['1'])
      })
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '1' }, { user_id: '1' }, { user_id: '1' }, { user_id: '1' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereLikeClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .whereLike('name', '%Warren Buffet%')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [{ _id: '2', name: 'Warren Buffet' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereILikeClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .whereILike('name', '%Warren Buffet%')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [{ _id: '2', name: 'Warren Buffet' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAWhereExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .whereExists(query => {
  //       query.select(query.raw('1')).from('users').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAWhereNotExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' },
  //     { _id: '3', name: 'Alan Turing' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('users')
  //     .select('_id', 'name')
  //     .whereNotExists(query => {
  //       query.select(query.raw('1')).from('rents').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  // }

  @Test()
  public async shouldBeAbleToAddAWhereInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').select('_id', 'name').whereIn('name', ['Alan Turing']).findMany()

    assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereNotInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').whereNotIn('_id', ['1', '2']).findMany()

    assert.containsSubset(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').whereBetween('_id', ['1', '3']).findMany()

    assert.containsSubset(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAWhereNotBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').whereNotBetween('_id', ['1', '3']).findMany()

    assert.isEmpty(data)
  }

  @Test()
  public async shouldBeAbleToAddAWhereNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').select('_id', 'name').whereNull('name').findMany()

    assert.deepEqual(data, [{ _id: '4', name: null }])
  }

  @Test()
  public async shouldBeAbleToAddAWhereNotNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').select('_id', 'name').whereNotNull('name').orderBy('_id').findMany()

    assert.deepEqual(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .orWhere('user_id', '=', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereClauseWithDefaultEqualOpToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .orWhere('user_id', '2')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereClauseAsClosureToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .orWhere(query => {
        query.whereIn('user_id', ['2'])
      })
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrWhereRawClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .select('user_id')
  //     .orWhereRaw("user_id = '2' ORDER BY user_id")
  //     .findMany()

  //   assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  // }

  @Test()
  public async shouldBeAbleToAddAOrWhereNotClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .orWhereNot('user_id', '1')
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '2' }, { user_id: '2' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereNotClauseAsFunctionToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver
      .table('rents')
      .select('user_id')
      .orWhereNot(query => {
        query.whereIn('user_id', ['1'])
      })
      .orderBy('user_id')
      .findMany()

    assert.deepEqual(data, [{ user_id: '1' }, { user_id: '1' }, { user_id: '1' }, { user_id: '1' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereLikeClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .orWhereLike('name', '%Warren Buffet%')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [{ _id: '2', name: 'Warren Buffet' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereILikeClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' }
    ])

    const data = await this.driver
      .table('users')
      .select('_id', 'name')
      .orWhereILike('name', '%Warren Buffet%')
      .orderBy('_id')
      .findMany()

    assert.deepEqual(data, [{ _id: '2', name: 'Warren Buffet' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrWhereExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('rents')
  //     .orWhereExists(query => {
  //       query.select(query.raw('1')).from('users').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])
  // }

  // TODO Throw not implemented
  // @Test()
  // public async shouldBeAbleToAddAOrWhereNotExistsClauseToTheQueryUsingDriver({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' },
  //     { _id: '3', name: 'Alan Turing' }
  //   ])
  //   await this.driver.table('rents').createMany([
  //     { _id: '1', user_id: '1' },
  //     { _id: '2', user_id: '1' },
  //     { _id: '3', user_id: '1' },
  //     { _id: '4', user_id: '1' },
  //     { _id: '5', user_id: '2' },
  //     { _id: '6', user_id: '2' }
  //   ])

  //   const data = await this.driver
  //     .table('users')
  //     .select('_id', 'name')
  //     .orWhereNotExists(query => {
  //       query.select(query.raw('1')).from('rents').whereRaw('users.id = rents.user_id')
  //     })
  //     .findMany()

  //   assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  // }

  @Test()
  public async shouldBeAbleToAddAOrWhereInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').select('_id', 'name').orWhereIn('name', ['Alan Turing']).findMany()

    assert.deepEqual(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereNotInClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').orWhereNotIn('_id', ['1', '2']).findMany()

    assert.containsSubset(data, [{ _id: '3', name: 'Alan Turing' }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.table('users').orWhereBetween('_id', ['1', '3']).findMany()

    assert.containsSubset(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereNotBetweenClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.table('users').orWhereNotBetween('_id', ['1', '3']).findMany()

    assert.isEmpty(data)
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])
    await this.driver.table('rents').createMany([
      { _id: '1', user_id: '1' },
      { _id: '2', user_id: '1' },
      { _id: '3', user_id: '1' },
      { _id: '4', user_id: '1' },
      { _id: '5', user_id: '2' },
      { _id: '6', user_id: '2' }
    ])

    const data = await this.driver.table('users').select('_id', 'name').orWhereNull('name').findMany()

    assert.deepEqual(data, [{ _id: '4', name: null }])
  }

  @Test()
  public async shouldBeAbleToAddAOrWhereNotNullClauseToTheQueryUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' },
      { _id: '4', name: null }
    ])

    const data = await this.driver.table('users').select('_id', 'name').orWhereNotNull('name').orderBy('_id').findMany()

    assert.deepEqual(data, [
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInASCUpperCaseDirectionUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.select('name').orderBy('name', 'ASC').findMany()

    assert.deepEqual(data, [{ name: 'Alan Turing' }, { name: 'Robert Kiyosaki' }, { name: 'Warren Buffet' }])
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInASCLowerCaseDirectionUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.select('name').orderBy('name', 'asc').findMany()

    assert.deepEqual(data, [{ name: 'Alan Turing' }, { name: 'Robert Kiyosaki' }, { name: 'Warren Buffet' }])
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInDESCUpperCaseDirectionUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.select('name').orderBy('name', 'DESC').findMany()

    assert.deepEqual(data, [{ name: 'Warren Buffet' }, { name: 'Robert Kiyosaki' }, { name: 'Alan Turing' }])
  }

  @Test()
  public async shouldOrderBySpecifiedColumnInDESCLowerCaseDirectionUsingDriver({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.select('name').orderBy('name', 'desc').findMany()

    assert.deepEqual(data, [{ name: 'Warren Buffet' }, { name: 'Robert Kiyosaki' }, { name: 'Alan Turing' }])
  }

  // TODO Throw not implemented
  // @Test()
  // public async shouldOrderBySpecifiedColumnInGivenDirectionUsingRawSQL({ assert }: Context) {
  //   await this.driver.table('users').createMany([
  //     { _id: '1', name: 'Robert Kiyosaki' },
  //     { _id: '2', name: 'Warren Buffet' },
  //     { _id: '3', name: 'Alan Turing' },
  //     { _id: '4', name: null }
  //   ])

  //   const data = await this.driver.table('users').select('name').orderByRaw('name DESC NULLS LAST').findMany()

  //   assert.deepEqual(data, [
  //     { name: 'Warren Buffet' },
  //     { name: 'Robert Kiyosaki' },
  //     { name: 'Alan Turing' },
  //     { name: null }
  //   ])
  // }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingLatest({ assert }: Context) {
    await this.driver.table('users').create({ _id: '1', name: 'Robert Kiyosaki', created_at: new Date() })
    const latest = await this.driver.table('users').create({ _id: '3', name: 'Alan Turing', created_at: new Date() })

    const data = await this.driver.table('users').latest('created_at').find()

    assert.deepEqual(latest, data)
  }

  @Test()
  public async shouldBeAbleToAutomaticallyOrderTheDataByDatesUsingOldest({ assert }: Context) {
    const oldest = await this.driver
      .table('users')
      .create({ _id: '1', name: 'Robert Kiyosaki', created_at: new Date() })
    await this.driver.table('users').create({ _id: '3', name: 'Alan Turing', created_at: new Date() })

    const data = await this.driver.table('users').oldest('created_at').find()

    assert.deepEqual(oldest, data)
  }

  @Test()
  public async shouldOffsetTheResultsByGivenValue({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.table('users').select('name').offset(1).findMany()

    assert.deepEqual(data, [{ name: 'Warren Buffet' }, { name: 'Alan Turing' }])
  }

  @Test()
  public async shouldLimitTheResultsByGivenValue({ assert }: Context) {
    await this.driver.table('users').createMany([
      { _id: '1', name: 'Robert Kiyosaki' },
      { _id: '2', name: 'Warren Buffet' },
      { _id: '3', name: 'Alan Turing' }
    ])

    const data = await this.driver.table('users').select('name').limit(1).findMany()

    assert.deepEqual(data, [{ name: 'Robert Kiyosaki' }])
  }
}
