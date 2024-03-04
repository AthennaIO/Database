/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder, Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeMigrationCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAMigrationFile({ assert, command }: Context) {
    const output = await command.run('make:migration TestMigration')
    const file = new Folder(Path.fixtures('storage/database/migrations')).loadSync().files[0]

    output.assertSucceeded()
    assert.isTrue(file.fileExists)
    output.assertLogged('[ MAKING MIGRATION ]')
    output.assertLogged(`[  success  ] Migration "${file.name}" successfully created.`)
  }

  @Test()
  public async shouldBeAbleToCreateAMigrationFileWithDifferentDestination({ assert, command }: Context) {
    const output = await command.run('make:migration TestMigration', {
      path: Path.fixtures('consoles/dest-import-console.ts')
    })
    const file = new Folder(Path.fixtures('storage/migrations')).loadSync().files[0]

    output.assertSucceeded()
    assert.isTrue(file.fileExists)
    output.assertLogged('[ MAKING MIGRATION ]')
    output.assertLogged(`[  success  ] Migration "${file.name}" successfully created.`)
  }
}
