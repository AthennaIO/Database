/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Path, Folder, Config } from '@secjs/utils'

import { DriverFactory } from '#src/Factories/DriverFactory'
import { PostgresDriver } from '#src/Drivers/PostgresDriver'
import { DriverExistException } from '#src/Exceptions/DriverExistException'
import { NotFoundDriverException } from '#src/Exceptions/NotFoundDriverException'
import { NotImplementedConfigException } from '#src/Exceptions/NotImplementedConfigException'

test.group('DriverFactoryTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Config().safeLoad(Path.config('database.js'))
  })

  group.each.setup(async () => {
    await DriverFactory.closeAllDriversConnection()
    await DriverFactory.createConnectionByName('postgres')
  })

  group.each.teardown(async () => {
    await DriverFactory.closeAllDriversConnection()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
  })

  test('should be able to get the available drivers of DriverFactory', async ({ assert }) => {
    const drivers = DriverFactory.availableDrivers()
    const connectedDrivers = DriverFactory.availableDrivers(true)

    assert.deepEqual(drivers, ['mysql', 'postgres'])
    assert.deepEqual(connectedDrivers, ['postgres'])
  })

  test('should be able to create a new driver implementation', async ({ assert }) => {
    class OtherDriver {}

    DriverFactory.createDriver('other', OtherDriver)

    const drivers = DriverFactory.availableDrivers()

    assert.deepEqual(drivers, ['mysql', 'postgres', 'other'])
  })

  test('should throw a driver exist exception', async ({ assert }) => {
    class OtherDriver {}

    assert.throws(() => DriverFactory.createDriver('other', OtherDriver), DriverExistException)
  })

  test('should be able to fabricate drivers', async ({ assert }) => {
    const driver = DriverFactory.fabricate('postgres')

    assert.instanceOf(driver, PostgresDriver)
  })

  test('should throw a not implemented config exception', async ({ assert }) => {
    assert.throws(() => DriverFactory.fabricate('notImplemented'), NotImplementedConfigException)
  })

  test('should throw a not implemented driver exception', async ({ assert }) => {
    assert.throws(() => DriverFactory.fabricate('nullDriver'), NotFoundDriverException)
  })
})