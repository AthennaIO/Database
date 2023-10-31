/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServiceProvider } from '@athenna/ioc'
import { DatabaseImpl } from '#src/database/DatabaseImpl'

export class DatabaseProvider extends ServiceProvider {
  public async boot() {
    const database = new DatabaseImpl()

    ioc.instance('Athenna/Core/Database', database)

    if (database.isConnected()) {
      return
    }

    if (Config.get<string[]>('rc.environments', []).includes('artisan')) {
      return
    }

    if (Config.get('database.autoConnect', false)) {
      await database.connect()
    }
  }

  public async shutdown() {
    const Database = this.container.use('Athenna/Core/Database')

    if (!Database) {
      return
    }

    await Database.closeAll()
  }
}
