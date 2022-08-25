/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@secjs/utils'
import { ServiceProvider } from '@athenna/ioc'

import { DatabaseImpl } from '#src/index'
import { DriverFactory } from '#src/Factories/DriverFactory'

export class DatabaseProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    await DriverFactory.createConnectionByName(Config.get('database.default'))

    this.container.bind('Athenna/Core/Database', DatabaseImpl)
  }
}
