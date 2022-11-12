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

import { Criteria, Database, Model } from '#src/index'
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
    await Database.closeAll()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should throw schema/definition not implemented exception', async ({ assert }) => {
    assert.throws(() => Model.getSchema(), NotImplementedSchemaException)
    await assert.rejects(() => Model.definition(), NotImplementedDefinitionException)
  })

  test('should be able to get the driver client and query builder from the connections', async ({ assert }) => {
    const client = Model.getClient()
    const queryBuilder = Model.getQueryBuilder()

    assert.isDefined(client)
    assert.isDefined(queryBuilder)
  })

  test('should be able to list criterias', async ({ assert }) => {
    class SimpleModel extends Model {
      static criterias() {
        return {
          select: Criteria.select('id').get(),
        }
      }
    }

    SimpleModel.addCriteria('orderBy', Criteria.orderBy('id', 'DESC'))

    const criterias = SimpleModel.getCriterias()

    assert.isDefined(criterias.select)
    assert.isDefined(criterias.orderBy)
  })
})
