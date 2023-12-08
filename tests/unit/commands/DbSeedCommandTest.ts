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

export default class DbSeedCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunApplicationSeeders({ command }: Context) {
    const output = await command.run('db:seed', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ SEEDING DATABASE ]')
    output.assertLogged('Running "UserSeeder" seeder')
    output.assertLogged('Running "ProfileSeeder" seeder')
    output.assertLogged('running user seeder')
    output.assertLogged('running profile seeder')
  }

  @Test()
  public async shouldBeAbleToChooseWhichApplicationSeedersToRun({ command }: Context) {
    const output = await command.run('db:seed --classes=UserSeeder', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ SEEDING DATABASE ]')
    output.assertLogged('Running "UserSeeder" seeder')
    output.assertNotLogged('Running "ProfileSeeder" seeder')
    output.assertLogged('running user seeder')
    output.assertNotLogged('running profile seeder')
  }

  @Test()
  public async shouldBeAbleToChangeDatabaseConnectionToRunSeeders({ command }: Context) {
    const output = await command.run('db:seed --connection=fake', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ SEEDING DATABASE ]')
    output.assertLogged('Running "UserSeeder" seeder')
    output.assertLogged('Running "ProfileSeeder" seeder')
    output.assertLogged('running user seeder')
    output.assertLogged('running profile seeder')
  }
}
