/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { test } from '@japa/runner'
import { Config, Folder, Path } from '@secjs/utils'

import { NotImplementedDefinitionException } from '#src/Exceptions/NotImplementedDefinitionException'
import { NotImplementedSchemaException } from '#src/Exceptions/NotImplementedSchemaException'
import { Database, Model } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('ModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
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
