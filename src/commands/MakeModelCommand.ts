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

    const destination = Config.get(
      'rc.commands.make:model.destination',
      Path.models()
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('model')
      .setNameProperties(true)
      .make()

    this.logger.success(`Model ({yellow} "${file.name}") successfully created.`)

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('models', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ models += "${importPath}" ])`
    )
  }
}
