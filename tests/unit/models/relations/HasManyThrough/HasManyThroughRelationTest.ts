/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { Sale } from '#tests/fixtures/models/e2e/Sale'
import { Region } from '#tests/fixtures/models/e2e/Region'
import { Article } from '#tests/fixtures/models/e2e/Article'
import { SaleItem } from '#tests/fixtures/models/e2e/SaleItem'
import { Appointment } from '#tests/fixtures/models/e2e/Appointment'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class HasManyThroughRelationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new DatabaseProvider().register()

    const pg = Database.connection('postgres-docker')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.revertMigrations()
    await pg.runMigrations()

    // Shape A — Region (1) -> Members (1,2) -> Articles (1,2,3)
    await pg.table('regions').create({ id: 1, name: 'South' })
    await pg.table('regions').create({ id: 2, name: 'North' })
    await pg.table('members').createMany([
      { id: 1, name: 'lenon', regionId: 1 },
      { id: 2, name: 'txsoura', regionId: 1 },
      { id: 3, name: 'orphan', regionId: 2 }
    ])
    await pg.table('articles').createMany([
      { id: 1, title: 'first', memberId: 1 },
      { id: 2, title: 'second', memberId: 1 },
      { id: 3, title: 'third', memberId: 2 }
    ])

    // Shape B — Appointment (1) -> SaleItems (1,2,3) -> Sales (1,1,2)
    //          Appointment (2) -> no sale_items
    await pg.table('appointments').createMany([
      { id: 1, name: 'a-1' },
      { id: 2, name: 'a-2' }
    ])
    await pg.table('sales').createMany([
      { id: 1, total: 100 },
      { id: 2, total: 200 }
    ])
    await pg.table('sale_items').createMany([
      { id: 1, quantity: 1, appointmentId: 1, saleId: 1 },
      { id: 2, quantity: 2, appointmentId: 1, saleId: 1 },
      { id: 3, quantity: 1, appointmentId: 1, saleId: 2 }
    ])
  }

  @AfterEach()
  public async afterEach() {
    const pg = Database.connection('postgres-docker')

    await pg.revertMigrations()

    await Database.closeAll()
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
  }

  @Test()
  public async shouldLoadHasManyThroughShapeAUsingWith({ assert }: Context) {
    const region = await Region.query().with('articles').where('id', 1).find()

    assert.instanceOf(region, Region)
    assert.lengthOf(region.articles, 3)
    assert.instanceOf(region.articles[0], Article)
  }

  @Test()
  public async shouldLoadHasManyThroughShapeAUsingLoadInstance({ assert }: Context) {
    const region = await Region.query().where('id', 1).find()

    await region.load('articles')

    assert.instanceOf(region.articles[0], Article)
    assert.lengthOf(region.articles, 3)
  }

  @Test()
  public async shouldLoadHasManyThroughShapeAUsingFindMany({ assert }: Context) {
    const regions = await Region.query().with('articles').orderBy('id').findMany()

    assert.lengthOf(regions, 2)
    assert.lengthOf(regions[0].articles, 3)
    assert.isEmpty(regions[1].articles)
  }

  @Test()
  public async shouldFilterUsingWhereHasShapeA({ assert }: Context) {
    const regions = await Region.query()
      .whereHas('articles', query => query.where('title', 'first'))
      .findMany()

    assert.lengthOf(regions, 1)
    assert.deepEqual(regions[0].id, 1)
  }

  @Test()
  public async shouldNotMatchWhereHasShapeAWhenClosureDoesNotMatch({ assert }: Context) {
    const regions = await Region.query()
      .whereHas('articles', query => query.where('title', 'does-not-exist'))
      .findMany()

    assert.isEmpty(regions)
  }

  @Test()
  public async shouldLoadHasManyThroughShapeBUsingWith({ assert }: Context) {
    const appointment = await Appointment.query().with('sales').where('id', 1).find()

    assert.instanceOf(appointment, Appointment)
    assert.lengthOf(appointment.sales, 2)
    assert.instanceOf(appointment.sales[0], Sale)
  }

  @Test()
  public async shouldDeduplicateFinalsInShapeBWhenManyThroughRowsPointAtTheSameFinal({ assert }: Context) {
    const appointment = await Appointment.query().with('sales').where('id', 1).find()

    const ids = appointment.sales.map(s => s.id).sort()

    assert.deepEqual(ids, [1, 2])
  }

  @Test()
  public async shouldLoadHasManyThroughShapeBUsingFindMany({ assert }: Context) {
    const appointments = await Appointment.query().with('sales').orderBy('id').findMany()

    assert.lengthOf(appointments, 2)
    assert.lengthOf(appointments[0].sales, 2)
    assert.isEmpty(appointments[1].sales)
  }

  @Test()
  public async shouldFilterUsingWhereHasShapeB({ assert }: Context) {
    const appointments = await Appointment.query()
      .whereHas('sales', query => query.where('total', 100))
      .findMany()

    assert.lengthOf(appointments, 1)
    assert.deepEqual(appointments[0].id, 1)
  }

  @Test()
  public async shouldNotMatchWhereHasShapeBWhenClosureDoesNotMatch({ assert }: Context) {
    const appointments = await Appointment.query()
      .whereHas('sales', query => query.where('total', 999))
      .findMany()

    assert.isEmpty(appointments)
  }

  @Test()
  public async shouldRespectExplicitlyPassedKeysAndNotApplyLaravelDefaults({ assert }: Context) {
    const region = await Region.query().where('id', 1).find()

    await region.load('articles', query => query.select('id', 'title', 'memberId'))

    assert.lengthOf(region.articles, 3)
    assert.containSubset(region.articles[0], { id: 1, title: 'first' })
  }

  @Test()
  public async shouldSupportNestedWithThroughRelations({ assert }: Context) {
    const appointment = await Appointment.query()
      .with('saleItems')
      .where('id', 1)
      .find()

    assert.lengthOf(appointment.saleItems, 3)
    assert.instanceOf(appointment.saleItems[0], SaleItem)
  }

  @Test()
  public async shouldReturnEmptyArrayWhenParentHasNoThroughRowsHasManyThrough({ assert }: Context) {
    const appointment = await Appointment.query().with('sales').where('id', 2).find()

    assert.instanceOf(appointment, Appointment)
    assert.isEmpty(appointment.sales)
  }
}
