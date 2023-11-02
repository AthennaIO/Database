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
import { Database, DatabaseProvider, DriverFactory } from '#src'
import { Test, type Context, AfterEach, BeforeEach, Mock } from '@athenna/test'

export default class DatabaseProviderTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToRegisterDatabaseImplementationInTheContainer({ assert }: Context) {
    await new DatabaseProvider().register()

    assert.isTrue(ioc.has('Athenna/Core/Database'))
  }

  @Test()
  public async shouldBeAbleToUseDatabaseImplementationFromFacade({ assert }: Context) {
    await new DatabaseProvider().register()

    assert.isFalse(Database.isConnected())
  }

  @Test()
  public async shouldAutomaticallyShutdownAllOpenConnectionsWhenShuttingDownTheProvider({ assert }: Context) {
    Mock.when(DriverFactory, 'closeAllConnections').resolve(undefined)

    const provider = new DatabaseProvider()

    await provider.register()
    await provider.shutdown()

    assert.calledOnce(DriverFactory.closeAllConnections)
  }

  @Test()
  public async shouldNotTryToCloseConnectionIfDependencyIsNotRegisteredInTheServiceContainer({ assert }: Context) {
    Mock.when(DriverFactory, 'closeAllConnections').resolve(undefined)

    const provider = new DatabaseProvider()

    await provider.shutdown()

    assert.notCalled(DriverFactory.closeAllConnections)
  }
}
