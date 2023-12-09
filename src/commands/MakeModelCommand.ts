/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { sep, resolve, isAbsolute } from 'node:path'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeModelCommand extends BaseCommand {
  @Argument({
    description: 'The model name.'
  })
  public name: string

  public static signature(): string {
    return 'make:model'
  }

  public static description(): string {
    return 'Make a new model file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING MODEL ])\n')

    const file = await this.generator
      .path(this.getFilePath())
      .template('model')
      .setNameProperties(true)
      .make()

    this.logger.success(`Model ({yellow} "${file.name}") successfully created.`)
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
      'rc.commands.make:model.destination',
      Path.app('models')
    )

    if (!isAbsolute(destination)) {
      destination = resolve(Path.pwd(), destination)
    }

    return destination
  }
}
