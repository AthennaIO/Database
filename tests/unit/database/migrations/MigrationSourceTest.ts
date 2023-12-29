/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FakeDriver } from '#src/database/drivers/FakeDriver'
import { MigrationSource } from '#src/database/migrations/MigrationSource'
import { Test, Mock, AfterEach, type Context, BeforeEach } from '@athenna/test'

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

    assert.deepEqual(migrations[0].name, '2022_10_08_0000012_create_countries_table.ts')
    assert.deepEqual(migrations[1].name, '2022_10_08_0000013_create_capitals_table.ts')
  }

  @Test()
  public async shouldBeAbleToGetAllMigrationsFromMigrationsDirAndCheckTheOnesThatShouldRun({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrations = await new MigrationSource('postgres-docker').getMigrations()

    assert.lengthOf(migrations, 8)
    assert.deepEqual(migrations[0].name, '2022_10_08_000000_create_uuid_function_postgres.ts')
  }

  @Test()
  public async shouldBeAbleToGetTheMigrationName({ assert }: Context) {
    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    const migrationSource = new MigrationSource('fake')
    const migrations = await migrationSource.getMigrations()
    const name = migrationSource.getMigrationName(migrations[0])

    assert.deepEqual(name, '2022_10_08_0000012_create_countries_table.ts')
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
