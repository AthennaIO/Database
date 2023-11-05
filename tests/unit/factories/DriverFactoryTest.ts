/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Json } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { DriverFactory } from '#src/factories/DriverFactory'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'
import { Test, Mock, type Context, AfterEach, BeforeEach } from '@athenna/test'
import { NotFoundDriverException } from '#src/exceptions/NotFoundDriverException'
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

    assert.deepEqual(drivers, ['mysql', 'sqlite', 'postgres', 'fake'])
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
  public async shouldBeAbleToVerifyThatDriverHasClient({ assert }: Context) {
    DriverFactory.setClient('mysql', {})

    const hasClient = DriverFactory.hasClient('mysql')

    assert.isTrue(hasClient)
  }

  @Test()
  public async shouldBeAbleToVerifyThatDriverDoesNotHaveClient({ assert }: Context) {
    const hasClient = DriverFactory.hasClient('mysql')

    assert.isFalse(hasClient)
  }

  @Test()
  public async shouldBeAbleToGetDriverClient({ assert }: Context) {
    DriverFactory.setClient('mysql', {})

    const client = DriverFactory.getClient('mysql')

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldReturnNullWhenClientDoesNotExist({ assert }: Context) {
    const client = DriverFactory.getClient('mysql')

    assert.isNull(client)
  }

  @Test()
  public async shouldBeAbleToSetDriverClient({ assert }: Context) {
    DriverFactory.setClient('mysql', {})

    const client = DriverFactory.getClient('mysql')

    assert.deepEqual(client, {})
  }

  @Test()
  public async shouldBeAbleToSetDriverClientAsNull({ assert }: Context) {
    DriverFactory.setClient('mysql', null)

    const client = DriverFactory.getClient('mysql')

    assert.isNull(client)
  }
}
