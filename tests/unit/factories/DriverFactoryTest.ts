/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { DriverFactory } from '#src/factories/DriverFactory'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'
import { Test, Mock, type Context, AfterEach, BeforeEach } from '@athenna/test'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { ConnectionFailedException } from '#src/exceptions/ConnectionFailedException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export default class DriverFactoryTest {
  public originalDrivers = DriverFactory.drivers

  @BeforeEach()
  public async beforeEach() {
    DriverFactory.drivers = Json.copy(this.originalDrivers)

    new LoggerProvider().register()
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public shouldBeAbleToListAllAvailableDrivers({ assert }: Context) {
    const drivers = DriverFactory.availableDrivers()

    assert.deepEqual(drivers, ['mysql', 'postgres', 'fake'])
  }

  @Test()
  public shouldBeAbleToListOnlyConnectedToDatabaseDrivers({ assert }: Context) {
    const drivers = DriverFactory.availableDrivers({ onlyConnected: true })

    assert.deepEqual(drivers, [])
  }

  @Test()
  public shouldBeAbleToSeePostgresDriverWhenListingOnlyConnectedAvailableDrivers({ assert }: Context) {
    Mock.when(DriverFactory.drivers, 'entries').return(
      new Map().set('postgres', { Driver: PostgresDriver, client: {} }).entries()
    )

    const drivers = DriverFactory.availableDrivers({ onlyConnected: true })

    assert.deepEqual(drivers, ['postgres'])
  }

  @Test()
  public shouldBeAbleToFabricateNewPostgresDriverInstance({ assert }: Context) {
    const driver = DriverFactory.fabricate('postgres')

    assert.instanceOf(driver, PostgresDriver)
  }

  @Test()
  public shouldBeAbleToFabricateTheDefaultDriverInstance({ assert }: Context) {
    const driver = DriverFactory.fabricate('default')

    assert.deepEqual(driver, new FakeDriverClass())
  }

  @Test()
  public async shouldThrowNotFoundDriverExceptionWhenDriverDoesNotExist({ assert }: Context) {
    await assert.rejects(() => DriverFactory.fabricate('not-found-driver'), NotFoundDriverException)
  }

  @Test()
  public async shouldThrowNotImplementedConfigExceptionWhenConfigDoesNotExist({ assert }: Context) {
    await assert.rejects(() => DriverFactory.fabricate('not-found-config'), NotImplementedConfigException)
  }

  @Test()
  public shouldBeAbleToFabricateTheDriverWithTheSavedClientOfFactory({ assert }: Context) {
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver, client: {} })

    const driver = DriverFactory.fabricate('postgres')

    assert.instanceOf(driver, PostgresDriver)
    assert.deepEqual(driver.getClient(), {})
  }

  @Test()
  public async shouldBeAbleToCreateConnectionWithDefaultDatabase({ assert }: Context) {
    Mock.when(ConnectionFactory, 'fake').return({})

    const connection = DriverFactory.createConnection('default')

    assert.deepEqual(connection, {})
  }

  @Test()
  public async shouldBeAbleToCreateConnectionWithTheDefaultDatabase({ assert }: Context) {
    Mock.when(ConnectionFactory, 'fake').return({})

    const connection = DriverFactory.createConnection('default')

    assert.deepEqual(connection, {})
  }

  @Test()
  public async shouldBeAbleToCreateConnectionWithPostgresDatabase({ assert }: Context) {
    Mock.when(ConnectionFactory, 'postgres').return({})

    const connection = DriverFactory.createConnection('postgres')

    assert.deepEqual(connection, {})
  }

  @Test()
  public async shouldBeAbleToSaveTheCreatedConnectionIfSaveOnFactoryIsTrue({ assert }: Context) {
    Mock.when(ConnectionFactory, 'postgres').return({})

    const connection = DriverFactory.createConnection('postgres', { saveOnFactory: true })

    assert.deepEqual(connection, {})
    assert.deepEqual(DriverFactory.drivers.get('postgres').client, {})
  }

  @Test()
  public async shouldNotSaveTheCreatedConnectionIfSaveOnFactoryIsFalse({ assert }: Context) {
    Mock.when(ConnectionFactory, 'postgres').return({})

    const connection = DriverFactory.createConnection('postgres', { saveOnFactory: false })

    assert.deepEqual(connection, {})
    assert.isNull(DriverFactory.drivers.get('postgres').client)
  }

  @Test()
  public async shouldBeAbleToLogIfConnectionWasSuccessfullyCreatedWithDatabase({ assert }: Context) {
    const logSuccessFake = Mock.fake()
    Config.set('rc.bootLogs', true)
    Log.when('channelOrVanilla').return({
      success: logSuccessFake
    })
    Mock.when(ConnectionFactory, 'postgres').return({})

    const connection = DriverFactory.createConnection('postgres')

    assert.deepEqual(connection, {})
    assert.calledWith(Log.channelOrVanilla, 'application')
    assert.calledWith(logSuccessFake, 'Successfully connected to ({yellow} postgres) database connection')
  }

  @Test()
  public async shouldThrowConnectionFailedExceptionIfConnectionWithDatabaseFails({ assert }: Context) {
    Mock.when(ConnectionFactory, 'postgres').throw(new Error('Connection failed!'))

    assert.throws(() => DriverFactory.createConnection('postgres'), ConnectionFailedException)
  }

  @Test()
  public async shouldBeAbleToCloseTheConnectionWithDefaultDatabaseWhenClientExists({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }
    DriverFactory.drivers.set('fake', { Driver: FakeDriverClass, client: clientFake })

    await DriverFactory.closeConnection('default')

    assert.calledOnce(clientFake.destroy)
  }

  @Test()
  public async shouldBeAbleToCloseTheConnectionWithPostgresWhenClientExists({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver, client: clientFake })

    await DriverFactory.closeConnection('postgres')

    assert.calledOnce(clientFake.destroy)
  }

  @Test()
  public async shouldSetTheClientToNullWhenClosingTheConnectionWithDriver({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver, client: clientFake })

    await DriverFactory.closeConnection('postgres')

    assert.calledOnce(clientFake.destroy)
    assert.isNull(DriverFactory.drivers.get('postgres').client)
  }

  @Test()
  public async shouldIgnoreTheOpWhenClientIsNotDefinedInDriver() {
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver })

    await DriverFactory.closeConnection('postgres')
  }

  @Test()
  public async shouldBeAbleToCloseAllOpenedConnectionsWithAllDrivers({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }
    Mock.when(DriverFactory, 'availableDrivers').return(['postgres'])
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver, client: clientFake })

    await DriverFactory.closeAllConnections()

    assert.calledOnce(clientFake.destroy)
  }
}
