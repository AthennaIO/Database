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
import { Log, LoggerProvider } from '@athenna/logger'
import { DriverFactory } from '#src/factories/DriverFactory'
import { PostgresDriver } from '#src/drivers/PostgresDriver'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { Test, Mock, type Context, BeforeEach, AfterEach } from '@athenna/test'

export default class ConnectionFactoryTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))
    new LoggerProvider().register()
  }

  @AfterEach()
  public afterEach() {
    Mock.restoreAll()
    Config.clear()
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionUsingKnex({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.knex('postgres', 'pg')

    assert.calledWith(knexFake, {
      client: 'pg',
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
    const mongooseFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getMongoose').return({ createConnection: mongooseFake })

    ConnectionFactory.mongoose('mongo')

    assert.calledWith(mongooseFake, 'mongodb://localhost:27017', { replicaSet: 'admin' })
  }

  @Test()
  public async shouldBeAbleToCreateTheConnectionToMysqlDirectly({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.mysql('mysql')

    assert.calledWith(knexFake, {
      client: 'mysql2',
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
  public async shouldLogSuccessfulConnectionMessageWhenConnectingToMysql({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const knexFake = Mock.fake()
    const successFake = Mock.fake()

    Log.when('channelOrVanilla').return({ success: successFake })
    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.mysql('mysql')

    assert.calledWith(Log.channelOrVanilla, 'application')
    assert.calledWith(successFake, 'Successfully connected to ({yellow} mysql) database connection')
    assert.calledWith(knexFake, {
      client: 'mysql2',
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
  public async shouldBeAbleToCreateTheConnectionToSqliteDirectly({ assert }: Context) {
    const knexFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.sqlite('sqlite')

    assert.calledWith(knexFake, {
      client: 'better-sqlite3',
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
  public async shouldLogSuccessfulConnectionMessageWhenConnectingToSqlite({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const knexFake = Mock.fake()
    const successFake = Mock.fake()

    Log.when('channelOrVanilla').return({ success: successFake })
    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.sqlite('sqlite')

    assert.calledWith(Log.channelOrVanilla, 'application')
    assert.calledWith(successFake, 'Successfully connected to ({yellow} sqlite) database connection')
    assert.calledWith(knexFake, {
      client: 'better-sqlite3',
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

    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.postgres('postgres')

    assert.calledWith(knexFake, {
      client: 'pg',
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
  public async shouldLogSuccessfulConnectionMessageWhenConnectingToPostgres({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const knexFake = Mock.fake()
    const successFake = Mock.fake()

    Log.when('channelOrVanilla').return({ success: successFake })
    Mock.when(ConnectionFactory, 'getKnex').return({ default: knexFake })

    ConnectionFactory.postgres('postgres')

    assert.calledWith(Log.channelOrVanilla, 'application')
    assert.calledWith(successFake, 'Successfully connected to ({yellow} postgres) database connection')
    assert.calledWith(knexFake, {
      client: 'pg',
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
    const mongooseFake = Mock.fake()

    Mock.when(ConnectionFactory, 'getMongoose').return({ createConnection: mongooseFake })

    ConnectionFactory.mongo('mongo')

    assert.calledWith(mongooseFake, 'mongodb://localhost:27017', { replicaSet: 'admin' })
  }

  @Test()
  public async shouldLogSuccessfulConnectionMessageWhenConnectingToMongo({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const mongooseFake = Mock.fake()
    const successFake = Mock.fake()

    Log.when('channelOrVanilla').return({ success: successFake })

    Mock.when(ConnectionFactory, 'getMongoose').return({ createConnection: mongooseFake })

    ConnectionFactory.mongo('mongo')

    assert.calledWith(Log.channelOrVanilla, 'application')
    assert.calledWith(successFake, 'Successfully connected to ({yellow} mongo) database connection')
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
  public async shouldBeAbleToCloseSqliteConnection({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }

    await ConnectionFactory.closeByDriver('sqlite', clientFake)

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

  @Test()
  public async shouldBeAbleToCloseAllOpenedConnectionsWithAllDrivers({ assert }: Context) {
    const clientFake = {
      destroy: Mock.fake()
    }
    Mock.when(DriverFactory, 'availableDrivers').return(['postgres'])
    Mock.when(DriverFactory.drivers, 'get').return({ Driver: PostgresDriver, client: clientFake })

    await ConnectionFactory.closeAllConnections()

    assert.calledOnce(clientFake.destroy)
  }
}
