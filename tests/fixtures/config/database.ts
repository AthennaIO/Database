/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export default {
  default: 'fake',

  connections: {
    fake: {
      driver: 'fake',
      validations: true
    },
    mysql: {
      driver: 'mysql'
    },
    postgres: {
      driver: 'postgres'
    },
    mongo: {
      url: 'mongodb://localhost:27017',
      replicaSet: 'admin'
    },
    'not-found-driver': {
      driver: 'not-found'
    },
    'mysql-docker': {
      driver: 'mysql',
      connection: {
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: '12345',
        database: 'athenna'
      },
      debug: false
    },
    'sqlite-memory': {
      driver: 'sqlite',
      connection: {
        filename: ':memory:'
      },
      debug: false
    },
    'postgres-docker': {
      driver: 'postgres',
      connection: {
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: '12345',
        database: 'postgres'
      },
      debug: false
    },
    'mongo-memory': {
      driver: 'mongo',
      url: 'mongodb://localhost:27017,localhost:27018,localhost:27019/admin',
      w: 'majority',
      replicaSet: 'rs',
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
}
