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

export default class DbFreshCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunDbFreshCommand({ command }: Context) {
    const output = await command.run('db:fresh --connection=fake', {
      path: Path.fixtures('consoles/db-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ WIPING DATABASE ]')
    output.assertLogged('[ RUNNING MIGRATIONS ]')
  }
}
