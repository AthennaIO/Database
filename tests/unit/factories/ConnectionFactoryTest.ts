/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { FakeDriver } from '#src/database/drivers/FakeDriver'
import { MongoDriver } from '#src/database/drivers/MongoDriver'
import { TestDriver } from '#tests/fixtures/drivers/TestDriver'
import { SqliteDriver } from '#src/database/drivers/SqliteDriver'
import { PostgresDriver } from '#src/database/drivers/PostgresDriver'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { AfterEach, BeforeEach, Mock, Test, type Context } from '@athenna/test'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/exceptions/NotImplementedConfigException'

export class ConnectionFactoryTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    ConnectionFactory.connections = new Map()
    ConnectionFactory.drivers.delete('test')
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToGetAllAvailableDrivers({ assert }: Context) {
    const availableDrivers = ConnectionFactory.availableDrivers()

    assert.deepEqual(availableDrivers, ['fake', 'mongo', 'mysql', 'sqlite', 'postgres'])
  }

  @Test()
  public async shouldBeAbleToGetAllAvailableConnections({ assert }: Context) {
    const availableConnections = ConnectionFactory.availableConnections()

    assert.deepEqual(availableConnections, [])
  }

  @Test()
  public async shouldBeAbleToGetAllAvailableConnectionsWhenTheyExist({ assert }: Context) {
    ConnectionFactory.setClient('test', {})

    const availableConnections = ConnectionFactory.availableConnections()

    assert.deepEqual(availableConnections, ['test'])
  }

  @Test()
  public async shouldBeAbleToFabricateNewConnectionsAndReturnFakeDriverInstance({ assert }: Context) {
    const driver = ConnectionFactory.fabricate('fake')

    assert.deepEqual(driver, FakeDriver)
  }

  @Test()
  public async shouldBeAbleToFabricateNewConnectionsAndReturnMongoDriverInstance({ assert }: Context) {
    const driver = ConnectionFactory.fabricate('mongo')

    assert.instanceOf(driver, MongoDriver)
  }

  @Test()
  public async shouldBeAbleToFabricateNewConnectionsAndReturnMySqlDriverInstance({ assert }: Context) {
    const driver = ConnectionFactory.fabricate('mysql')

    assert.instanceOf(driver, MySqlDriver)
  }

  @Test()
  public async shouldBeAbleToFabricateNewConnectionsAndReturnSqliteDriverInstance({ assert }: Context) {
    const driver = ConnectionFactory.fabricate('sqlite')

    assert.instanceOf(driver, SqliteDriver)
  }

  @Test()
  public async shouldBeAbleToFabricateNewConnectionsAndReturnPostgresDriverInstance({ assert }: Context) {
    const driver = ConnectionFactory.fabricate('postgres')

    assert.instanceOf(driver, PostgresDriver)
  }

  @Test()
  public async shouldThrowNotFoundDriverExceptionWhenTryingToUseANotImplementedDriver({ assert }: Context) {
    assert.throws(() => ConnectionFactory.fabricate('not-found'), NotFoundDriverException)
  }

  @Test()
  public async shouldThrowNotImplementedConfigExceptionWhenTryingToUseANotImplementedDriver({ assert }: Context) {
    assert.throws(() => ConnectionFactory.fabricate('not-found-con'), NotImplementedConfigException)
  }

  @Test()
  public async shouldBeAbleToCreateOwnDriverImplementationToUseWithinDatabaseFacade({ assert }: Context) {
    ConnectionFactory.createDriver('test', TestDriver)

    const testDriver = ConnectionFactory.fabricate('test')

    assert.instanceOf(testDriver, TestDriver)

    ConnectionFactory.drivers.delete('test')
    ConnectionFactory.connections.delete('test')
  }

  @Test()
  public shouldBeAbleToFabricateTheDriverWithTheSavedClientOfConnection({ assert }: Context) {
    Mock.when(ConnectionFactory.connections, 'get').return({ client: {} })

    const driver = ConnectionFactory.fabricate('postgres')

    assert.instanceOf(driver, PostgresDriver)
    assert.deepEqual(driver.getClient(), {})
  }

  @Test()
  public async shouldBeAbleToVerifyThatDriverHasClient({ assert }: Context) {
    ConnectionFactory.setClient('mysql', {})

    const hasClient = ConnectionFactory.hasClient('mysql')

    assert.isTrue(hasClient)
  }

  @Test()
  public async shouldBeAbleToVerifyThatDriverDoesNotHaveClient({ assert }: Context) {
    const hasClient = ConnectionFactory.hasClient('mysql')

    assert.isFalse(hasClient)
  }

  @Test()
  public async shouldBeAbleToGetDriverClient({ assert }: Context) {
    ConnectionFactory.setClient('mysql', {})

    const client = ConnectionFactory.getClient('mysql')

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldReturnUndefinedWhenClientDoesNotExist({ assert }: Context) {
    const client = ConnectionFactory.getClient('mysql')

    assert.isUndefined(client)
  }

  @Test()
  public async shouldBeAbleToSetDriverClient({ assert }: Context) {
    ConnectionFactory.setClient('mysql', {})

    const client = ConnectionFactory.getClient('mysql')

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldBeAbleToSetDriverClientAsNull({ assert }: Context) {
    ConnectionFactory.setClient('mysql', null)

    const client = ConnectionFactory.getClient('mysql')

    assert.isNull(client)
  }
}
