/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MongoMemory } from '#tests/helpers/MongoMemory'
import { command } from '@athenna/artisan/testing/plugins'
import { Runner, assert, specReporter } from '@athenna/test'
import { DriverFactory } from '#src/factories/DriverFactory'
import { FakeDriverClass } from '#tests/fixtures/drivers/FakeDriverClass'

DriverFactory.drivers.set('fake', { Driver: FakeDriverClass, client: null })

await MongoMemory.start()

await Runner.setTsEnv()
  .addPlugin(assert())
  .addPlugin(command())
  .addReporter(specReporter())
  .addPath('tests/unit/**/*.ts')
  .setForceExit()
  .setCliArgs(process.argv.slice(2))
  .setGlobalTimeout(30000)
  .run()
  .finally(() => MongoMemory.stop())
