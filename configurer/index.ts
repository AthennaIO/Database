/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { relative } from 'node:path'
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

    task.addPromise('Update commands of .athennarc.json', () => {
      return this.rc
        .setTo(
          'commands',
          'make:model',
          '@athenna/database/commands/MakeModelCommand'
        )
        .setTo(
          'commands',
          'make:seeder',
          '@athenna/database/commands/MakeSeederCommand'
        )
        .setTo(
          'commands',
          'make:migration',
          '@athenna/database/commands/MakeMigrationCommand'
        )
        .setTo('commands', 'db:seed', {
          path: '@athenna/database/commands/DbSeedCommand',
          loadApp: true
        })
        .setTo('commands', 'migration:run', {
          path: '@athenna/database/commands/MigrationRunCommand',
          loadApp: true
        })
        .setTo('commands', 'migration:revert', {
          path: '@athenna/database/commands/MigrationRevertCommand',
          loadApp: true
        })
        .save()
    })

    task.addPromise('Update templates of .athennarc.json', () => {
      return this.rc
        .setTo(
          'templates',
          'model',
          'node_modules/@athenna/database/templates/model.edge'
        )
        .setTo(
          'templates',
          'seeder',
          'node_modules/@athenna/database/templates/seeder.edge'
        )
        .setTo(
          'templates',
          'migration',
          'node_modules/@athenna/database/templates/migration.edge'
        )
        .save()
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
            'DB_DEBUG=false\n' +
            'DB_URL=mongodb://root:root@localhost:27017/admin\n'
          break
        case 'sqlite':
          envs =
            '\nDB_CONNECTION=sqlite\n' +
            'DB_DEBUG=false\n' +
            `DB_FILENAME=${this.databasePath()}/sqlite.db\n`
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
            'DB_DEBUG=false\n' +
            'DB_USERNAME=root\n' +
            'DB_PASSWORD=root\n' +
            'DB_DATABASE=athenna\n'
      }

      const testEnvs = envs.replace(
        `DB_CONNECTION=${connection}`,
        'DB_CONNECTION=fake'
      )

      return new File(Path.pwd('.env'), '')
        .append(envs)
        .then(() => new File(Path.pwd('.env.test'), '').append(testEnvs))
        .then(() => new File(Path.pwd('.env.example'), '').append(envs))
    })

    if (connection !== 'sqlite') {
      task.addPromise('Add service to docker-compose.yml file', async () => {
        const hasDockerCompose = await File.exists(
          Path.pwd('docker-compose.yml')
        )

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
    }

    await task.run()

    console.log()
    this.logger.success(
      'Successfully configured ({dim,yellow} @athenna/database) library'
    )

    const libraries = {
      mysql: 'knex mysql2',
      postgres: 'knex pg',
      sqlite: 'knex better-sqlite3',
      mongo: 'mongoose'
    }

    const instruction = this.logger
      .instruction()
      .head('Run following commands to get started:')
      .add(`npm install ${libraries[connection]}`)

    if (connection !== 'sqlite') {
      instruction.add(`docker-compose up -d`)
    }

    instruction.render()
  }

  private databasePath() {
    return relative(Path.pwd(), Path.database().replace(/\\/g, '/'))
  }
}
