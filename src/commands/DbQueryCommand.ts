/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { BaseCommand, Argument, Option } from '@athenna/artisan'

export class DbQueryCommand extends BaseCommand {
  @Argument({
    signature: 'query...',
    description: 'The raw SQL query to execute.'
  })
  public query: string[]

  @Option({
    default: 'default',
    signature: '-c, --connection <connection>',
    description: 'Set the the database connection.'
  })
  public connection: string

  public static signature(): string {
    return 'db:query'
  }

  public static description(): string {
    return 'Run a raw SQL query against the database.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ RUNNING QUERY ])\n')

    const sql = this.query.join(' ')
    const DB = Database.connection(this.connection)

    try {
      const result = await DB.raw(sql)

      if (result === null || result === undefined) {
        return
      }

      if (Is.Object(result) || Is.Array(result)) {
        this.logger.simple(JSON.stringify(result))

        return
      }

      this.logger.simple(String(result))
    } finally {
      await DB.close()
    }
  }
}
