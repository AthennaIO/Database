/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeSeederCommand extends BaseCommand {
  @Argument({
    description: 'The seeder name.'
  })
  public name: string

  public static signature(): string {
    return 'make:seeder'
  }

  public static description(): string {
    return 'Make a new seeder file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING SEEDER ])\n')

    const destination = Config.get(
      'rc.commands.make:seeder.destination',
      Path.seeders()
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('seeder')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Seeder ({yellow} "${file.name}") successfully created.`
    )
  }
}
