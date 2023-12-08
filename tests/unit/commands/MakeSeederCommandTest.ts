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

export default class MakeSeederCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateASeederFile({ assert, command }: Context) {
    const output = await command.run('make:seeder TestSeeder')

    output.assertSucceeded()
    output.assertLogged('[ MAKING SEEDER ]')
    output.assertLogged('[  success  ] Seeder "TestSeeder" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/database/seeders/TestSeeder.ts')))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:seeder TestSeeder')
    const output = await command.run('make:seeder TestSeeder')

    output.assertFailed()
    output.assertLogged('[ MAKING SEEDER ]')
    output.assertLogged('The file')
    output.assertLogged('TestSeeder.ts')
    output.assertLogged('already exists')
  }
}
