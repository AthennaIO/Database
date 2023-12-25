/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { ServiceProvider } from '@athenna/ioc'
import { DatabaseImpl } from '#src/database/DatabaseImpl'

export class DatabaseProvider extends ServiceProvider {
  public async register() {
    this.container.instance('athennaDbOpts', undefined)
    this.container.singleton('Athenna/Core/Database', DatabaseImpl)

    const paths = Config.get('rc.models', [])
    const promises = paths.map(path => {
      return Module.getFromWithAlias(path, 'App/Models').then(
        ({ alias, module }) => {
          this.container.transient(alias, module)

          if (!module.sync()) {
            return
          }

          return module.schema().sync()
        }
      )
    })

    await Promise.all(promises)
  }

  public async shutdown() {
    const database = this.container.use('Athenna/Core/Database')

    if (!database) {
      return
    }

    await database.closeAll()
  }
}
