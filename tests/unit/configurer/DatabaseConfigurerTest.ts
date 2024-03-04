/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Rc } from '@athenna/config'
import { LoggerProvider } from '@athenna/logger'
import { File, Folder, Path } from '@athenna/common'
import DatabaseConfigurer from '../../../configurer/index.js'
import { Test, type Context, Mock, AfterEach, BeforeEach } from '@athenna/test'

export default class DatabaseConfigurerTest {
  private cwd = process.cwd()
  private pjson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    new LoggerProvider().register()
    await Rc.setFile(Path.pwd('package.json'))
    await new Folder(Path.fixtures('storage')).load()
    process.chdir(Path.fixtures('storage'))
  }

  @AfterEach()
  public async afterEach() {
    ioc.reconstruct()
    Mock.restoreAll()
    process.chdir(this.cwd)
    await Folder.safeRemove(Path.fixtures('storage'))
    await new File(Path.pwd('package.json')).setContent(this.pjson)
  }

  @Test()
  public async shouldBeAbleToRunDatabaseConfigurerForMySqlDatabase({ assert }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('mysql')

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\n\nservices:\n  mysql:\n    container_name: athenna_mysql\n    image: mysql\n    ports:\n      - '3306:3306'\n    environment:\n      MYSQL_DATABASE: athenna\n      MYSQL_ROOT_PASSWORD: root\n      MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=mysql\n` +
        'DB_HOST=localhost\n' +
        `DB_PORT=3306\n` +
        'DB_DEBUG=false\n' +
        'DB_USERNAME=root\n' +
        'DB_PASSWORD=root\n' +
        'DB_DATABASE=athenna\n'
    )
  }

  @Test()
  public async shouldBeAbleToUpdateDockerComposeFileWhenItAlreadyExistWhenRunningMySqlConfigurer({ assert }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('mysql')

    await new File(this.cwd + sep + 'tests' + sep + 'fixtures' + sep + 'docker-compose.yml').copy(
      Path.pwd('docker-compose.yml')
    )

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\nservices:\n  app:\n    container_name: athenna_app\n  mysql:\n    container_name: athenna_mysql\n    image: mysql\n    ports:\n      - '3306:3306'\n    environment:\n      MYSQL_DATABASE: athenna\n      MYSQL_ROOT_PASSWORD: root\n      MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=mysql\n` +
        'DB_HOST=localhost\n' +
        `DB_PORT=3306\n` +
        'DB_DEBUG=false\n' +
        'DB_USERNAME=root\n' +
        'DB_PASSWORD=root\n' +
        'DB_DATABASE=athenna\n'
    )
  }

  @Test()
  public async shouldBeAbleToRunDatabaseConfigurerForPostgresDatabase({ assert }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('postgres')

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\n\nservices:\n  postgres:\n    container_name: athenna_postgres\n    image: postgres\n    ports:\n      - '5432:5432'\n    environment:\n      POSTGRES_DB: athenna\n      POSTGRES_USER: root\n      POSTGRES_PASSWORD: root\n      POSTGRES_ROOT_PASSWORD: root\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=postgres\n` +
        'DB_HOST=localhost\n' +
        `DB_PORT=5432\n` +
        'DB_DEBUG=false\n' +
        'DB_USERNAME=root\n' +
        'DB_PASSWORD=root\n' +
        'DB_DATABASE=athenna\n'
    )
  }

  @Test()
  public async shouldBeAbleToUpdateDockerComposeFileWhenItAlreadyExistWhenRunningPostgresConfigurer({
    assert
  }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('postgres')

    await new File(this.cwd + sep + 'tests' + sep + 'fixtures' + sep + 'docker-compose.yml').copy(
      Path.pwd('docker-compose.yml')
    )

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\nservices:\n  app:\n    container_name: athenna_app\n  postgres:\n    container_name: athenna_postgres\n    image: postgres\n    ports:\n      - '5432:5432'\n    environment:\n      POSTGRES_DB: athenna\n      POSTGRES_USER: root\n      POSTGRES_PASSWORD: root\n      POSTGRES_ROOT_PASSWORD: root\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=postgres\n` +
        'DB_HOST=localhost\n' +
        `DB_PORT=5432\n` +
        'DB_DEBUG=false\n' +
        'DB_USERNAME=root\n' +
        'DB_PASSWORD=root\n' +
        'DB_DATABASE=athenna\n'
    )
  }

  @Test()
  public async shouldBeAbleToRunDatabaseConfigurerForMongoDatabase({ assert }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('mongo')

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\n\nservices:\n  mongo:\n    container_name: athenna_mongo\n    image: mongo\n    ports:\n      - '27017:27017'\n    environment:\n      MONGO_INITDB_ROOT_USERNAME: root\n      MONGO_INITDB_ROOT_PASSWORD: root\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=mongo\n` + 'DB_DEBUG=false\n' + 'DB_URL=mongodb://root:root@localhost:27017/admin\n'
    )
  }

  @Test()
  public async shouldBeAbleToUpdateDockerComposeFileWhenItAlreadyExistWhenRunningMongoConfigurer({ assert }: Context) {
    const configurer = new DatabaseConfigurer()

    Mock.when(configurer.npm, 'install').resolve(undefined)
    Mock.when(configurer.prompt, 'list').resolve('mongo')

    await new File(this.cwd + sep + 'tests' + sep + 'fixtures' + sep + 'docker-compose.yml').copy(
      Path.pwd('docker-compose.yml')
    )

    await configurer.configure()

    const envFile = await new File(Path.pwd('.env')).getContentAsString()
    const dockerComposeFile = await new File(Path.pwd('docker-compose.yml')).getContentAsString()

    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.test')))
    assert.isTrue(await File.exists(Path.pwd('.env.example')))
    assert.isTrue(await File.exists(Path.pwd('config/database.ts')))
    assert.deepEqual(
      dockerComposeFile,
      "version: '3'\nservices:\n  app:\n    container_name: athenna_app\n  mongo:\n    container_name: athenna_mongo\n    image: mongo\n    ports:\n      - '27017:27017'\n    environment:\n      MONGO_INITDB_ROOT_USERNAME: root\n      MONGO_INITDB_ROOT_PASSWORD: root\n"
    )
    assert.deepEqual(
      envFile,
      `\nDB_CONNECTION=mongo\n` + 'DB_DEBUG=false\n' + 'DB_URL=mongodb://root:root@localhost:27017/admin\n'
    )
  }
}
