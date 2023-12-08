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

export default class MigrationRevertCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRevertApplicationMigrations({ command }: Context) {
    const output = await command.run('migration:revert', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ REVERTING MIGRATIONS ]')
    output.assertLogged('[  success  ] Successfully reverted migrations on "undefined" database.')
  }

  @Test()
  public async shouldBeAbleToChangeDatabaseConnectionToRevertMigrations({ command }: Context) {
    const output = await command.run('migration:revert --connection=fake', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ REVERTING MIGRATIONS ]')
    output.assertLogged('[  success  ] Successfully reverted migrations on "undefined" database.')
  }
}
