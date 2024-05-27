/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Folder, Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeCrudCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAnEmptyCrud({ assert, command }: Context) {
    const output = await command.run('make:crud user', {
      path: Path.fixtures('consoles/crud/without-id-and-timestamps.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/User.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/http/controllers/UserController.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/services/UserService.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/e2e/UserControllerTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/unit/UserServiceTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isTrue(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }

  @Test()
  public async shouldBeAbleToCreateACrudWithIdAndTimestamps({ assert, command }: Context) {
    const output = await command.run('make:crud user', {
      path: Path.fixtures('consoles/crud/with-id-and-timestamps.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/User.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/http/controllers/UserController.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/services/UserService.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/e2e/UserControllerTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/unit/UserServiceTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isTrue(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }

  @Test()
  public async shouldBeAbleToCreateACrudWithIdTimestampsAndCustomProps({ assert, command }: Context) {
    const output = await command.run('make:crud user', {
      path: Path.fixtures('consoles/crud/with-properties.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/User.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/http/controllers/UserController.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/services/UserService.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/e2e/UserControllerTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/unit/UserServiceTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isTrue(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }

  @Test()
  public async shouldBeAbleToCreateACrudForMongoDb({ assert, command }: Context) {
    const output = await command.run('make:crud user --is-mongo', {
      path: Path.fixtures('consoles/crud/with-properties.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/User.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/http/controllers/UserController.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/services/UserService.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/e2e/UserControllerTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/unit/UserServiceTest.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isFalse(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }

  @Test()
  public async shouldBeAbleToDisableFileCreation({ assert, command }: Context) {
    const output = await command.run('make:crud user', {
      path: Path.fixtures('consoles/crud/disabled.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isFalse(await File.exists(Path.fixtures('storage/app/models/User.ts')))
    assert.isFalse(await File.exists(Path.fixtures('storage/app/http/controllers/UserController.ts')))
    assert.isFalse(await File.exists(Path.fixtures('storage/app/services/UserService.ts')))
    assert.isFalse(await File.exists(Path.fixtures('storage/tests/e2e/UserControllerTest.ts')))
    assert.isFalse(await File.exists(Path.fixtures('storage/tests/unit/UserServiceTest.ts')))
    assert.isFalse(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isFalse(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }

  @Test()
  public async shouldBeAbleToDefineADifferentFileCaseForFiles({ assert, command }: Context) {
    const output = await command.run('make:crud user', {
      path: Path.fixtures('consoles/crud/file-case.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING CRUD ]')
    output.assertLogged(`[  success  ] CRUD "user" successfully created.`)

    assert.isTrue(await File.exists(Path.fixtures('storage/app/models/user.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/http/controllers/user.controller.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/app/services/user.service.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/e2e/user.controller.test.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/tests/unit/user.service.test.ts')))
    assert.isTrue(await File.exists(Path.fixtures('storage/routes/http.ts')))
    assert.isTrue(await Folder.exists(Path.fixtures('storage/database/migrations')))
  }
}
