/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MigrationRunCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunApplicationMigrations({ command }: Context) {
    const output = await command.run('migration:run', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING MIGRATIONS ]')
    output.assertLogged('[  success  ] Successfully ran migrations on "fake" database.')
  }

  @Test()
  public async shouldBeAbleToChangeDatabaseConnectionToRunMigrations({ command }: Context) {
    const output = await command.run('migration:run --connection=fake', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING MIGRATIONS ]')
    output.assertLogged('[  success  ] Successfully ran migrations on "fake" database.')
  }

  @Test()
  public async shouldSkipRunningMigrationsIfDriverIsMongo({ command }: Context) {
    const output = await command.run('migration:run --connection=fakeMongo', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING MIGRATIONS ]')
    output.assertLogged('Connection "fakeMongo" is using "mongo" driver and migrations run will be skipped.')
  }
}
