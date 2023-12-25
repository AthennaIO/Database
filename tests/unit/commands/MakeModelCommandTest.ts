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

export default class MakeModelCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAModelFile({ assert, command }: Context) {
    const output = await command.run('make:model TestModel')

    output.assertSucceeded()
    output.assertLogged('[ MAKING MODEL ]')
    output.assertLogged('[  success  ] Model "TestModel" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/TestModel.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateAModelFileForMongo({ assert, command }: Context) {
    const output = await command.run('make:model TestModel', {
      path: Path.fixtures('consoles/mongo-model-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING MODEL ]')
    output.assertLogged('[  success  ] Model "TestModel" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/TestModel.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateAModelFileWithDifferentDestination({ assert, command }: Context) {
    const output = await command.run('make:model TestModel', {
      path: Path.fixtures('consoles/dest-import-console.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING MODEL ]')
    output.assertLogged('[  success  ] Model "TestModel" successfully created.')
    assert.isTrue(await File.exists(Path.fixtures('storage/models/TestModel.ts')))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:model TestModel')
    const output = await command.run('make:model TestModel')

    output.assertFailed()
    output.assertLogged('[ MAKING MODEL ]')
    output.assertLogged('The file')
    output.assertLogged('TestModel.ts')
    output.assertLogged('already exists')
  }
}
