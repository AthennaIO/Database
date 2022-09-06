/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'

import { Database, DatabaseImpl } from '#src/index'

export class DatabaseProvider extends ServiceProvider {
  /**
   * Bootstrap any application services.
   *
   * @return {Promise<void>}
   */
  async boot() {
    this.container.bind('Athenna/Core/Database', DatabaseImpl)

    if (
      process.env.DB_AUTO_CONNECT &&
      (process.env.DB_AUTO_CONNECT === true ||
        process.env.DB_AUTO_CONNECT === 'true' ||
        process.env.DB_AUTO_CONNECT === '(true)')
    ) {
      await Database.connect()
    }
  }
}
