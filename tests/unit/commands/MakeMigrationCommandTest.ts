/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeMigrationCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAMigrationFile({ assert, command }: Context) {
    const output = await command.run('make:migration TestMigration')

    output.assertSucceeded()
    output.assertLogged('[ MAKING MIGRATION ]')
    output.assertLogged('[  success  ] Migration "TestMigration" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/database/migrations/TestMigration.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateAMigrationFileWithDifferentDestination({ assert, command }: Context) {
    const output = await command.run('make:migration TestMigration', {
      path: Path.fixtures('consoles/dest-import-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING MIGRATION ]')
    output.assertLogged('[  success  ] Migration "TestMigration" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/migrations/TestMigration.ts')))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:migration TestMigration')
    const output = await command.run('make:migration TestMigration')

    output.assertFailed()
    output.assertLogged('[ MAKING MIGRATION ]')
    output.assertLogged('The file')
    output.assertLogged('TestMigration.ts')
    output.assertLogged('already exists')
  }
}
