/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseConfigurer } from '@athenna/artisan'
import { File, Module, Parser, Path } from '@athenna/common'

export default class DatabaseConfigurer extends BaseConfigurer {
  public async configure() {
    const connection = await this.prompt.list(
      'What will be your default connection?',
      ['mysql', 'postgres', 'sqlite', 'mongo']
    )

    const ext = Path.ext()
    const task = this.logger.task()

    task.addPromise(`Create database.${ext} configuration file`, () => {
      return new File(`./database`).copy(Path.config(`database.${ext}`))
    })

    task.addPromise('Update providers of .athennarc.json', () => {
      return this.rc
        .pushTo('providers', '@athenna/database/providers/DatabaseProvider')
        .save()
    })

    task.addPromise('Update .env, .env.test and .env.example', () => {
      let envs = ''

      switch (connection) {
        case 'mongo':
          envs =
            '\nDB_CONNECTION=mongo\n' +
            'DB_URL=mongodb://root:root@localhost:27017/athenna\n'
          break
        case 'sqlite':
          envs =
            '\nDB_CONNECTION=sqlite\n' + 'DB_FILENAME=./database/sqlite.db\n'
          break
        default:
          // eslint-disable-next-line no-case-declarations
          const ports = {
            mysql: 3306,
            postgres: 5432
          }

          envs =
            `\nDB_CONNECTION=${connection}\n` +
            'DB_HOST=localhost\n' +
            `DB_PORT=${ports[connection]}\n` +
            'DB_USERNAME=root\n' +
            'DB_PASSWORD=root\n' +
            'DB_DATABASE=athenna\n'
      }

      return new File(Path.pwd('.env'), '')
        .append(envs)
        .then(() => new File(Path.pwd('.env.test'), '').append(envs))
        .then(() => new File(Path.pwd('.env.example'), '').append(envs))
    })

    if (connection === 'sqlite') {
      return task.run()
    }

    task.addPromise('Add service to docker-compose.yml file', async () => {
      const hasDockerCompose = await File.exists(Path.pwd('docker-compose.yml'))

      if (hasDockerCompose) {
        const docker = await new File(
          Path.pwd('docker-compose.yml')
        ).getContentAsYaml()

        docker.services[connection] = await Module.get(
          import(`./docker/${connection}/service.ts`)
        )

        return new File(Path.pwd('docker-compose.yml')).setContent(
          Parser.objectToYamlString(docker)
        )
      }

      return new File(`./docker/${connection}/file.yml`).copy(
        Path.pwd('docker-compose.yml')
      )
    })

    await task.run()
  }
}
