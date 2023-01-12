/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { DatabaseImpl } from '#src/index'
import { ServiceProvider } from '@athenna/ioc'

export class DatabaseProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    const Database = this.container
      .bind('Athenna/Core/Database', DatabaseImpl)
      .use('Athenna/Core/Database')

    if (Database.isConnected()) {
      return
    }

    if (Env('IS_ARTISAN', false)) {
      return
    }

    if (Env('DB_AUTO_CONNECT', true)) {
      await Database.connect()
    }
  }

  /**
   * Shutdown any application services.
   *
   * @return {void|Promise<void>}
   */
  async shutdown() {
    const Database = this.container.use('Athenna/Core/Database')

    if (!Database) {
      return
    }

    await Database.closeAll()
  }
}
