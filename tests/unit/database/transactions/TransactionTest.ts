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
import { DriverFactory } from '#src/factories/DriverFactory'
import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { QueryBuilder } from '#src/database/builders/QueryBuilder'
import { Transaction } from '#src/database/transactions/Transaction'
import { Test, AfterEach, BeforeEach, type Context, Mock } from '@athenna/test'

export default class TransactionTest {
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
  public async shouldBeAbleToCommitTheTransaction({ assert }: Context) {
    Mock.when(FakeDriver, 'commitTransaction').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.commitTransaction()

    assert.calledOnce(trx.driver.commitTransaction)
  }

  @Test()
  public async shouldBeAbleToRollbackTheTransaction({ assert }: Context) {
    Mock.when(FakeDriver, 'rollbackTransaction').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.rollbackTransaction()

    assert.calledOnce(trx.driver.rollbackTransaction)
  }

  @Test()
  public async shouldBeAbleToGetTheDatabaseClientFromDriver({ assert }: Context) {
    Mock.when(FakeDriver, 'getClient').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    const client = trx.getClient()

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldBeAbleToGetTheDatabaseQueryBuilderFromDriver({ assert }: Context) {
    Mock.when(FakeDriver, 'getQueryBuilder').return({})
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    const queryBuilder = trx.getQueryBuilder()

    assert.deepEqual(queryBuilder, {})
  }

  @Test()
  public async shouldBeAbleToRunMigrations({ assert }: Context) {
    Mock.when(FakeDriver, 'runMigrations').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.runMigrations()

    assert.calledOnce(trx.driver.runMigrations)
  }

  @Test()
  public async shouldBeAbleToRevertMigrations({ assert }: Context) {
    Mock.when(FakeDriver, 'revertMigrations').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.revertMigrations()

    assert.calledOnce(trx.driver.revertMigrations)
  }

  @Test()
  public async shouldBeAbleToGetTheDatabases({ assert }: Context) {
    Mock.when(FakeDriver, 'getDatabases').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.getDatabases()

    assert.calledOnce(trx.driver.getDatabases)
  }

  @Test()
  public async shouldBeAbleToGetTheCurrentDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'getCurrentDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.getCurrentDatabase()

    assert.calledOnce(trx.driver.getCurrentDatabase)
  }

  @Test()
  public async shouldBeAbleToValidateThatDatabaseExists({ assert }: Context) {
    Mock.when(FakeDriver, 'hasDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.hasDatabase('users')

    assert.calledOnceWith(trx.driver.hasDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToCreateDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'createDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.createDatabase('users')

    assert.calledOnceWith(trx.driver.createDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToDropDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'dropDatabase').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.dropDatabase('users')

    assert.calledOnceWith(trx.driver.dropDatabase, 'users')
  }

  @Test()
  public async shouldBeAbleToGetDatabaseTables({ assert }: Context) {
    Mock.when(FakeDriver, 'getTables').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.getTables()

    assert.calledOnce(trx.driver.getTables)
  }

  @Test()
  public async shouldBeAbleToVerifyIfTableExistsInDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'hasTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.hasTable('users')

    assert.calledOnceWith(trx.driver.hasTable, 'users')
  }

  @Test()
  public async shouldBeAbleToCreateTableInDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'createTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.createTable('users', builder => {
      builder.string('id').primary()
    })

    assert.calledOnceWith(trx.driver.createTable, 'users')
  }

  @Test()
  public async shouldBeAbleToDropTheDatabaseTable({ assert }: Context) {
    Mock.when(FakeDriver, 'dropTable').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.dropTable('users')

    assert.calledOnceWith(trx.driver.dropTable, 'users')
  }

  @Test()
  public async shouldBeAbleToTruncateTheDatabaseTable({ assert }: Context) {
    Mock.when(FakeDriver, 'truncate').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.truncate('users')

    assert.calledOnceWith(trx.driver.truncate, 'users')
  }

  @Test()
  public async shouldBeAbleToRunRawQueriesInTheDatabase({ assert }: Context) {
    Mock.when(FakeDriver, 'raw').resolve(undefined)
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    await trx.raw('SELECT * FROM users')

    assert.calledOnceWith(trx.driver.raw, 'SELECT * FROM users')
  }

  @Test()
  public async shouldBeAbleToCreateAQueryBuilderWhenSelectingATableToOperate({ assert }: Context) {
    Mock.when(DriverFactory, 'fabricate').return(FakeDriver)

    const trx = new Transaction(FakeDriver)
    const queryBuilder = trx.table('users')

    assert.deepEqual(queryBuilder, new QueryBuilder(trx.driver, 'users'))
  }
}
