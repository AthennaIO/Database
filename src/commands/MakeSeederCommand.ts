/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, String } from '@athenna/common'
import { sep, resolve, isAbsolute } from 'node:path'
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

    const file = await this.generator
      .path(this.getFilePath())
      .properties({ nameTable: String.pluralize(this.name) })
      .template('seeder')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Seeder ({yellow} "${file.name}") successfully created.`
    )
  }

  /**
   * Get the file path where it will be generated.
   */
  private getFilePath(): string {
    return this.getDestinationPath().concat(`${sep}${this.name}.${Path.ext()}`)
  }

  /**
   * Get the destination path for the file that will be generated.
   */
  private getDestinationPath(): string {
    let destination = Config.get(
      'rc.commands.make:seeder.destination',
      Path.seeders()
    )

    if (!isAbsolute(destination)) {
      destination = resolve(Path.pwd(), destination)
    }

    return destination
  }
}
