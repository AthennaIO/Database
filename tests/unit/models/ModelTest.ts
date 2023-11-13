/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import type { Connections } from '#src/types'
import { Database } from '#src/facades/Database'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach } from '@athenna/test'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'

export default class ModelTest {
  @BeforeEach()
  public async beforeEach() {
    new DatabaseProvider().register()
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Config.clear()
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToGetTheConnectionThatModelIsUsing({ assert }: Context) {
    Config.set('database.default', 'postgres')

    assert.deepEqual(Model.connection(), 'postgres')
  }

  @Test()
  public async shouldBeAbleToSetAValueForConnectionUsingInheritance({ assert }: Context) {
    class User extends Model {
      public static connection(): Connections {
        return 'mongo'
      }
    }

    assert.deepEqual(User.connection(), 'mongo')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTable({ assert }: Context) {
    assert.deepEqual(Model.table(), 'models')
  }

  @Test()
  public async shouldBeAbleToGetTheDefaultModelTableWhenUsingInheritance({ assert }: Context) {
    class User extends Model {}

    assert.deepEqual(User.table(), 'users')
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelSchemaFromModelClass({ assert }: Context) {
    assert.instanceOf(Model.schema(), ModelSchema)
  }

  @Test()
  public async shouldBeAbleToGenerateAnInstanceOfModelQueryBuilderFromModelClass({ assert }: Context) {
    assert.instanceOf(Model.query(), ModelQueryBuilder)
  }

  @Test()
  public async shouldGenerateTheInstanceDriverByConnectionForTheModelQueryBuilder({ assert }: Context) {
    Config.set('database.default', 'mongo-memory')
    Database.spy()

    assert.instanceOf(Model.query(), ModelQueryBuilder)
    assert.calledWith(Database.connection, 'mongo-memory')
  }
}
