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
    this.container.transient('Athenna/Core/Database', DatabaseImpl)

    const paths = Config.get('rc.models', [])
    const promises = paths.map(path => {
      return Module.resolve(path, Config.get('rc.parentURL')).then(Model => {
        this.container.transient(`App/Models/${Model.name}`, Model)

        if (!Model.sync()) {
          return
        }

        return Model.schema().sync()
      })
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
