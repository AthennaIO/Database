/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Folder, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { Database, Model } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { NotImplementedSchemaException } from '#src/Exceptions/NotImplementedSchemaException'
import { NotImplementedDefinitionException } from '#src/Exceptions/NotImplementedDefinitionException'

test.group('ModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await Database.connect()
    await Database.runMigrations()
  })

  group.each.teardown(async () => {
    await Database.revertMigrations()
    await Database.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should throw schema/definition not implemented exception', async ({ assert }) => {
    assert.throws(() => Model.getSchema(), NotImplementedSchemaException)
    await assert.rejects(() => Model.definition(), NotImplementedDefinitionException)
  })

  test('should be able to list criterias', async ({ assert }) => {
    class SimpleSoftDeleteModel extends Model {
      static schema() {
        return {}
      }

      static isSoftDelete() {
        return true
      }
    }

    const query = SimpleSoftDeleteModel.query()
    const criterias = query.removeCriteria('deletedAt').listCriterias()

    assert.isDefined(criterias)
    assert.isUndefined(criterias.deletedAt)

    const allCriterias = query.listCriterias(true)

    assert.isDefined(allCriterias)
    assert.isDefined(allCriterias.deletedAt)
  })
})
