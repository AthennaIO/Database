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
  public async register() {
    ioc.singleton('Athenna/Core/Database', DatabaseImpl)
  }

  public async shutdown() {
    const Database = this.container.use('Athenna/Core/Database')

    if (!Database) {
      return
    }

    await Database.closeAll()
  }
}
