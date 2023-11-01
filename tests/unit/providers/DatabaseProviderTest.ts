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
import { DatabaseProvider, DriverFactory } from '#src'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'
import { Test, type Context, AfterEach, BeforeEach, Mock } from '@athenna/test'

export default class DatabaseProviderTest {
  @BeforeEach()
  public async beforeEach() {
    DriverFactory.drivers.set('fake', { Driver: FakeDriverClass })
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public async afterEach() {
    ioc.reconstruct()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToRegisterDatabaseImplementationInTheContainer({ assert }: Context) {
    await new DatabaseProvider().register()

    assert.isTrue(ioc.has('Athenna/Core/Database'))
  }

  @Test()
  public async shouldAutomaticallyShutdownAllOpenConnectionsWhenShuttingDownTheProvider({ assert }: Context) {
    Mock.when(DriverFactory, 'closeAllConnections').resolve(undefined)

    const provider = new DatabaseProvider()

    await provider.register()
    await provider.shutdown()

    assert.calledOnce(DriverFactory.closeAllConnections)
  }
}
