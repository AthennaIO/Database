/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Config } from '@athenna/config'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { Test, Mock, type Context, BeforeEach, AfterEach } from '@athenna/test'

export default class ConnectionFactoryTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionUsingKnex({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').resolve({ default: knexFake })

    await ConnectionFactory.knex('postgres', 'pg')

    assert.calledWith(knexFake, {
      client: 'pg',
      connection: {
        driver: 'postgres'
      },
      debug: false,
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        acquireTimeoutMillis: 60000,
        max: 20,
        min: 2
      },
      useNullAsDefault: false
    })
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionUsingMongoose({ assert }: Context) {
    const mongooseFake = Mock.sandbox.stub().returns({
      asPromise: Mock.fake()
    })

    Mock.when(ConnectionFactory, 'getMongoose').resolve({ createConnection: mongooseFake })

    await ConnectionFactory.mongoose('mongo')

    assert.calledWith(mongooseFake, 'mongodb://localhost:27017', { replicaSet: 'admin' })
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionToMysqlDirectly({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').resolve({ default: knexFake })

    await ConnectionFactory.mysql('mysql')

    assert.calledWith(knexFake, {
      client: 'mysql2',
      connection: {
        driver: 'mysql'
      },
      debug: false,
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        acquireTimeoutMillis: 60000,
        max: 20,
        min: 2
      },
      useNullAsDefault: false
    })
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionToPostgresDirectly({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').resolve({ default: knexFake })

    await ConnectionFactory.postgres('postgres')

    assert.calledWith(knexFake, {
      client: 'pg',
      connection: {
        driver: 'postgres'
      },
      debug: false,
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        acquireTimeoutMillis: 60000,
        max: 20,
        min: 2
      },
      useNullAsDefault: false
    })
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionToMongoDirectly({ assert }: Context) {
    const mongooseFake = Mock.sandbox.stub().returns({
      asPromise: Mock.fake()
    })

    Mock.when(ConnectionFactory, 'getMongoose').resolve({ createConnection: mongooseFake })

    await ConnectionFactory.mongo('mongo')

    assert.calledWith(mongooseFake, 'mongodb://localhost:27017', { replicaSet: 'admin' })
  }

  @Test()
  public async shouldBeAbleToCloseMysqlConnection({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }

    await ConnectionFactory.closeByDriver('mysql', clientFake)

    assert.calledOnce(clientFake.destroy)
  }

  @Test()
  public async shouldBeAbleToClosePostgresConnection({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }

    await ConnectionFactory.closeByDriver('postgres', clientFake)

    assert.calledOnce(clientFake.destroy)
  }

  @Test()
  public async shouldBeAbleToCloseMongoConnection({ assert }: Context) {
    const clientFake = {
      close: Mock.fake()
    }

    await ConnectionFactory.closeByDriver('mongo', clientFake)

    assert.calledOnce(clientFake.close)
  }
}
