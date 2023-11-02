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
import { PostgresDriver } from '#src/drivers/PostgresDriver'
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
    await this.driver.dropTable('orders')
    await this.driver.dropTable('migrations')
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()

    await this.driver.close()

    Config.clear()
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
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await this.driver.runMigrations()

    assert.isTrue(await this.driver.hasTable('orders'))
  }

  @Test()
  public async shouldBeAbleToRollbackMigrationsUsingDriver({ assert }: Context) {
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
}
