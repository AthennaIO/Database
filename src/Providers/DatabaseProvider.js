/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

import { DatabaseImpl } from '#src/index'

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
