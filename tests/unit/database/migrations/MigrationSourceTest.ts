/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FakeDriver } from '#tests/fixtures/drivers/FakeDriver'
import { UsersMigration } from '#tests/fixtures/migrations/UsersMigration'
import { MigrationSource } from '#src/database/migrations/MigrationSource'
import { OrdersMigration } from '#tests/fixtures/migrations/OrdersMigration'
import { Test, Mock, AfterEach, type Context, BeforeEach } from '@athenna/test'
import { ProductsMigration } from '#tests/fixtures/migrations/ProductsMigration'

export default class MigrationSourceTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToGetAllMigrationsFromMigrationsDir({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrations = await new MigrationSource('fake').getMigrations()

    assert.deepEqual(migrations[0].name, 'ProductsMigration.ts')
    assert.deepEqual(migrations[0].Migration, ProductsMigration)
    assert.deepEqual(migrations[1].name, 'UsersMigration.ts')
    assert.deepEqual(migrations[1].Migration, UsersMigration)
  }

  @Test()
  public async shouldBeAbleToGetAllMigrationsFromMigrationsDirAndCheckTheOnesThatShouldRun({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrations = await new MigrationSource('postgres').getMigrations()

    assert.lengthOf(migrations, 1)
    assert.deepEqual(migrations[0].name, 'OrdersMigration.ts')
    assert.deepEqual(migrations[0].Migration, OrdersMigration)
  }

  @Test()
  public async shouldBeAbleToGetTheMigrationName({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrationSource = new MigrationSource('fake')
    const migrations = await migrationSource.getMigrations()
    const name = migrationSource.getMigrationName(migrations[0])

    assert.deepEqual(name, 'ProductsMigration.ts')
  }

  @Test()
  public async shouldBeAbleToGetTheMigrationUpAndDownMethods({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrationSource = new MigrationSource('fake')
    const migrations = await migrationSource.getMigrations()
    const { up, down } = await migrationSource.getMigration(migrations[0])

    assert.isFunction(up)
    assert.isFunction(down)
  }

  @Test()
  public async shouldBeAbleToSwapKnexClientWithDatabase({ assert }: Context) {
    const upFake = Mock.fake()
    const downFake = Mock.fake()
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))
    Mock.when(FakeDriver, 'createTable').resolve(undefined)
    Mock.when(FakeDriver, 'dropTable').resolve(undefined)

    const migrationSource = new MigrationSource('fake')
    const migrations = await migrationSource.getMigrations()
    const { up, down } = await migrationSource.getMigration(migrations[0])

    await up(upFake)
    assert.deepEqual(upFake, FakeDriver.client)
    assert.calledOnce(FakeDriver.createTable)

    await down(downFake)
    assert.deepEqual(downFake, FakeDriver.client)
    assert.calledOnce(FakeDriver.dropTable)
  }
}
