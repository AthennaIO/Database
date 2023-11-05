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
import { DatabaseImpl } from '#src/database/DatabaseImpl'
import { DriverFactory } from '#src/factories/DriverFactory'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { Test, AfterEach, BeforeEach, type Context, Mock } from '@athenna/test'

export default class DatabaseImplTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToConnectToTheDefaultDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'connect').resolve(undefined)

    const database = new DatabaseImpl()

    assert.calledOnce(database.driver.connect)
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseIsConnected({ assert }: Context) {
    Mock.when(FakeDriver, 'isConnected').value(true)

    const database = new DatabaseImpl().connect()
    const isConnected = database.isConnected()

    assert.isTrue(isConnected)
  }

  @Test()
  public async shouldBeAbleToConnectToPostgresDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'connect').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')

    assert.calledTimesWith(DriverFactory.fabricate, 3, 'postgres')
    assert.calledTimes(database.driver.connect, 2)
  }

  @Test()
  public async shouldBeAbleToCloseTheConnectionWithDefaultDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'close').resolve(undefined)

    const database = new DatabaseImpl().connect()
    await database.close()

    assert.calledOnce(database.driver.close)
  }

  @Test()
  public async shouldBeAbleToCloseTheConnectionWithPostgresDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'close').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.close()

    assert.calledOnce(database.driver.close)
  }

  @Test()
  public async shouldBeAbleToCloseAllConnections({ assert }: Context) {
    Mock.when(ConnectionFactory, 'closeAllConnections').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.closeAll()

    assert.calledOnce(ConnectionFactory.closeAllConnections)
  }

  @Test()
  public async shouldBeAbleToGetTheDatabaseClientFromDriver({ assert }: Context) {
    Mock.when(FakeDriver, 'getClient').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    const client = database.getClient()

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldBeAbleToGetTheDatabaseQueryBuilderFromDriver({ assert }: Context) {
    Mock.when(FakeDriver, 'getQueryBuilder').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    const queryBuilder = database.getQueryBuilder()

    assert.deepEqual(queryBuilder, {})
  }

  @Test()
  public async shouldBeAbleToStartDatabaseTransactions({ assert }: Context) {
    Mock.when(FakeDriver, 'startTransaction').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    const transaction = await database.startTransaction()

    assert.deepEqual(transaction, {})
  }

  @Test()
  public async shouldBeAbleToRunMigrations({ assert }: Context) {
    Mock.when(FakeDriver, 'runMigrations').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.runMigrations()

    assert.calledOnce(database.driver.runMigrations)
  }

  @Test()
  public async shouldBeAbleToRevertMigrations({ assert }: Context) {
    Mock.when(FakeDriver, 'revertMigrations').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.revertMigrations()

    assert.calledOnce(database.driver.revertMigrations)
  }

  @Test()
  public async shouldBeAbleToGetTheDatabases({ assert }: Context) {
    Mock.when(FakeDriver, 'getDatabases').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.getDatabases()

    assert.calledOnce(database.driver.getDatabases)
  }

  @Test()
  public async shouldBeAbleToGetTheCurrentDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'getCurrentDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.getCurrentDatabase()

    assert.calledOnce(database.driver.getCurrentDatabase)
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseExists({ assert }: Context) {
    Mock.when(FakeDriver, 'hasDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.hasDatabase('users')

    assert.calledOnceWith(database.driver.hasDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToCreateDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'createDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.createDatabase('users')

    assert.calledOnceWith(database.driver.createDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToDropDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'dropDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.dropDatabase('users')

    assert.calledOnceWith(database.driver.dropDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToGetDatabaseTables({ assert }: Context) {
    Mock.when(FakeDriver, 'getTables').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.getTables()

    assert.calledOnce(database.driver.getTables)
  }

  @Test()
  public async shouldBeAbleToVerifyIfTableExistsInDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'hasTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.hasTable('users')

    assert.calledOnceWith(database.driver.hasTable, 'users')
  }

  @Test()
  public async shouldBeAbleToCreateTableInDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'createTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.createTable('users', builder => {
      builder.string('id').primary()
    })

    assert.calledOnceWith(database.driver.createTable, 'users')
  }

  @Test()
  public async shouldBeAbleToDropTheDatabaseTable({ assert }: Context) {
    Mock.when(FakeDriver, 'dropTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.dropTable('users')

    assert.calledOnceWith(database.driver.dropTable, 'users')
  }

  @Test()
  public async shouldBeAbleToTruncateTheDatabaseTable({ assert }: Context) {
    Mock.when(FakeDriver, 'truncate').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.truncate('users')

    assert.calledOnceWith(database.driver.truncate, 'users')
  }

  @Test()
  public async shouldBeAbleToRunRawQueriesInTheDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'raw').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    await database.raw('SELECT * FROM users')

    assert.calledOnceWith(database.driver.raw, 'SELECT * FROM users')
  }

  @Test()
  public async shouldBeAbleToCreateAQueryBuilderWhenSelectingATableToOperate({ assert }: Context) {
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const database = new DatabaseImpl().connection('postgres')
    const queryBuilder = database.table('users')

    assert.deepEqual(queryBuilder, new QueryBuilder(database.driver, 'users'))
  }
}
