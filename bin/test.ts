/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parseArgs } from 'node:util'
import { Runner } from '@athenna/test'
import { MongoMemory } from '#tests/helpers/MongoMemory'
import { command } from '@athenna/artisan/testing/plugins'

const { values } = parseArgs({
  options: {
    'no-mongo': {
      type: 'boolean',
      multiple: false,
      default: false
    }
  },
  strict: false,
  args: process.argv.slice(2)
})

if (!values['no-mongo']) {
  await MongoMemory.start()
}

await Runner.setTsEnv()
  .addAssertPlugin()
  .addPlugin(command())
  .addPath('tests/unit/**/*.ts')
  .setForceExit()
  .setCliArgs(process.argv.slice(2))
  .setGlobalTimeout(30000)
  .run()
  .finally(() => MongoMemory.stop())
