/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { AfterEach, Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class DbQueryCommandTest extends BaseCommandTest {
  @AfterEach()
  public async afterEachQueryTest() {
    delete process.env.MOCK_RAW_TYPE
  }

  @Test()
  public async shouldBeAbleToRunARawQueryAndPrintObjectResultAsJson({ command }: Context) {
    const output = await command.run('db:query SELECT * from users --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('{}')
  }

  @Test()
  public async shouldPrintArrayResultAsJson({ command }: Context) {
    process.env.MOCK_RAW_TYPE = 'array'

    const output = await command.run('db:query SELECT * from users --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('[{"id":1,"name":"Lenon"}]')
  }

  @Test()
  public async shouldPrintNumberResultAsString({ command }: Context) {
    process.env.MOCK_RAW_TYPE = 'number'

    const output = await command.run('db:query SELECT COUNT(*) from users --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('42')
    output.assertNotLogged('{')
  }

  @Test()
  public async shouldPrintStringResultAsString({ command }: Context) {
    process.env.MOCK_RAW_TYPE = 'string'

    const output = await command.run('db:query SELECT version --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('hello')
  }

  @Test()
  public async shouldPrintBooleanResultAsString({ command }: Context) {
    process.env.MOCK_RAW_TYPE = 'boolean'

    const output = await command.run('db:query SELECT 1 --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('true')
  }

  @Test()
  public async shouldNotPrintAnyResultWhenQueryReturnsUndefined({ command }: Context) {
    process.env.MOCK_RAW_TYPE = 'undefined'

    const output = await command.run('db:query INSERT INTO users VALUES (1) --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertNotLogged('undefined')
    output.assertNotLogged('null')
  }

  @Test()
  public async shouldJoinMultipleTokensIntoTheRawQueryString({ command }: Context) {
    const output = await command.run('db:query SELECT id, name FROM users WHERE id = 1 --connection=fake', {
      path: Path.fixtures('consoles/db-query-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ RUNNING QUERY ]')
    output.assertLogged('{}')
  }
}
