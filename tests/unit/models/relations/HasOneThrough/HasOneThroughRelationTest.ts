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
import { Appointment } from '#tests/fixtures/models/e2e/Appointment'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class HasOneThroughRelationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new DatabaseProvider().register()

    const pg = Database.connection('postgres-docker')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.revertMigrations()
    await pg.runMigrations()

    // Shape A
    await pg.table('regions').createMany([
      { id: 1, name: 'South' },
      { id: 2, name: 'North' }
    ])
    await pg.table('members').createMany([
      { id: 1, name: 'lenon', regionId: 1 }
    ])
    await pg.table('articles').createMany([
      { id: 1, title: 'first', memberId: 1 },
      { id: 2, title: 'second', memberId: 1 }
    ])

    // Shape B
    await pg.table('appointments').createMany([
      { id: 1, name: 'a-1' },
      { id: 2, name: 'a-2' }
    ])
    await pg.table('sales').create({ id: 1, total: 100 })
    await pg.table('sale_items').createMany([
      { id: 1, quantity: 1, appointmentId: 1, saleId: 1 },
      { id: 2, quantity: 2, appointmentId: 1, saleId: 1 }
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
  public async shouldLoadHasOneThroughShapeAUsingFind({ assert }: Context) {
    const region = await Region.query().with('latestArticle').where('id', 1).find()

    assert.instanceOf(region, Region)
    assert.instanceOf(region.latestArticle, Article)
  }

  @Test()
  public async shouldLoadHasOneThroughShapeAUsingFindMany({ assert }: Context) {
    const regions = await Region.query().with('latestArticle').orderBy('id').findMany()

    assert.lengthOf(regions, 2)
    assert.instanceOf(regions[0].latestArticle, Article)
    assert.isNull(regions[1].latestArticle)
  }

  @Test()
  public async shouldReturnNullWhenNoThroughRowExists({ assert }: Context) {
    const region = await Region.query().with('latestArticle').where('id', 2).find()

    assert.instanceOf(region, Region)
    assert.isNull(region.latestArticle)
  }

  @Test()
  public async shouldLoadHasOneThroughShapeBUsingFind({ assert }: Context) {
    const appointment = await Appointment.query().with('sale').where('id', 1).find()

    assert.instanceOf(appointment, Appointment)
    assert.instanceOf(appointment.sale, Sale)
    assert.deepEqual(appointment.sale.id, 1)
  }

  @Test()
  public async shouldDeduplicateInShapeBHasOneThroughEvenWhenManyThroughRowsPointAtSameFinal({ assert }: Context) {
    const appointment = await Appointment.query().with('sale').where('id', 1).find()

    assert.instanceOf(appointment.sale, Sale)
  }

  @Test()
  public async shouldLoadHasOneThroughShapeBUsingFindMany({ assert }: Context) {
    const appointments = await Appointment.query().with('sale').orderBy('id').findMany()

    assert.lengthOf(appointments, 2)
    assert.instanceOf(appointments[0].sale, Sale)
    assert.isNull(appointments[1].sale)
  }

  @Test()
  public async shouldReturnNullWhenAppointmentHasNoSaleItems({ assert }: Context) {
    const appointment = await Appointment.query().with('sale').where('id', 2).find()

    assert.instanceOf(appointment, Appointment)
    assert.isNull(appointment.sale)
  }

  @Test()
  public async shouldFilterUsingWhereHasShapeB({ assert }: Context) {
    const appointments = await Appointment.query()
      .whereHas('sale', query => query.where('total', 100))
      .findMany()

    assert.lengthOf(appointments, 1)
    assert.deepEqual(appointments[0].id, 1)
  }

  @Test()
  public async shouldLoadFromInstanceShapeA({ assert }: Context) {
    const region = await Region.query().where('id', 1).find()

    await region.load('latestArticle')

    assert.instanceOf(region.latestArticle, Article)
  }
}
