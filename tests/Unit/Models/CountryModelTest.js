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
})
