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

import { DB } from '#src/index'
import { Capital } from '#tests/Stubs/models/Capital'
import { Country } from '#tests/Stubs/models/Country'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('CountryModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await DB.connect()
    await DB.runMigrations()

    await Capital.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await DB.revertMigrations()
    await DB.close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to load capital relation of countries', async ({ assert }) => {
    const [country] = await Country.query().with('capital').findMany()

    assert.isDefined(country.capital.id)
    assert.deepEqual(country.id, country.capital.countryId)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const capital = await Capital.query()
      .select('id', 'countryId')
      .with('country', query => query.select('id'))
      .find()

    assert.deepEqual(capital.countryId, capital.country.id)
    assert.isUndefined(capital.name, capital.country.name)
  })

  test('should be able to find relations using it queries from models', async ({ assert }) => {
    const country = await Country.find()
    const capital = await country.capitalQuery().find()

    assert.deepEqual(country.id, capital.countryId)
  })

  test('should be able to create relations using it queries from models', async ({ assert }) => {
    const country = await Country.create({ name: 'Brazil' })

    await country.load('capital')

    assert.isUndefined(country.capital)

    const capital = await country.capitalQuery().create({ name: 'Brasilia' })

    await country.refresh()

    assert.deepEqual(country.id, capital.countryId)
    assert.deepEqual(country.capital, capital)
  })

  test('should be able to update relations using it queries from models', async ({ assert }) => {
    const country = await Country.find()
    const capital = await country.capitalQuery().update({ name: 'Testing' })

    await country.load('capital')

    assert.deepEqual(country.id, capital.countryId)
    assert.deepEqual(country.capital, capital)
  })

  test('should be able to delete relations using it queries from models', async ({ assert }) => {
    const country = await Country.find()
    await country.capitalQuery().delete()

    await country.load('capital')

    assert.isUndefined(country.capital)
  })

  test('should be able to save the capital of the country using save method', async ({ assert }) => {
    const country = await Country.query().with('capital').find()

    country.capital.name = 'Testing'

    await country.save()
    await country.capital.refresh()

    assert.deepEqual(country.capital.name, 'Testing')
  })

  test('should be able to find models only where has the relation', async ({ assert }) => {
    await Country.create({ name: 'India' })
    const countries = await Country.query().has('capital').findMany()

    assert.lengthOf(countries, 10)
  })

  test('should be able to find models only where has the relation and callback', async ({ assert }) => {
    const country = await Country.create({ name: 'India' })
    await country.capitalQuery().create({ name: 'Nova Delhi' })

    const countries = await Country.query()
      .whereHas('capital', query => query.where('name', 'Nova Delhi'))
      .findMany()

    assert.lengthOf(countries, 1)
  })
})
