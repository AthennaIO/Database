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
import { User } from '#tests/fixtures/sync/User'
import { ConnectionFactory, Database, DatabaseProvider } from '#src'
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

    assert.isDefined(Database.connectionName)
  }

  @Test()
  public async shouldAutomaticallyShutdownAllOpenConnectionsWhenShuttingDownTheProvider({ assert }: Context) {
    Mock.when(ConnectionFactory, 'closeAllConnections').resolve(undefined)

    const provider = new DatabaseProvider()

    await provider.register()
    await provider.shutdown()

    assert.calledOnce(ConnectionFactory.closeAllConnections)
  }

  @Test()
  public async shouldNotTryToCloseConnectionIfDependencyIsNotRegisteredInTheServiceContainer({ assert }: Context) {
    Mock.when(ConnectionFactory, 'closeAllConnections').resolve(undefined)

    const provider = new DatabaseProvider()

    await provider.shutdown()

    assert.notCalled(ConnectionFactory.closeAllConnections)
  }

  @Test()
  public async shouldRegisterModelsInAthennaRcInTheContainer({ assert }: Context) {
    Mock.when(User, 'sync').return(false)
    Config.set('rc.models', ['#tests/fixtures/sync/User'])

    await new DatabaseProvider().register()

    assert.isTrue(ioc.has('App/Models/User'))
  }

  @Test()
  public async shouldRegisterModelsInAthennaRcInTheContainerAndSyncTheSchema({ assert }: Context) {
    const syncFake = Mock.fake()
    Mock.when(User, 'sync').return(true)
    Mock.when(User, 'schema').return({ sync: syncFake })

    Config.set('rc.models', ['#tests/fixtures/sync/User'])

    await new DatabaseProvider().register()

    assert.isTrue(ioc.has('App/Models/User'))
    assert.calledOnce(syncFake)
  }
}
