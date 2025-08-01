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
      driver: 'fake'
    },
    fakeMongo: {
      driver: 'mongo'
    },
    mysql: {
      driver: 'mysql'
    },
    sqlite: {
      driver: 'sqlite'
    },
    postgres: {
      driver: 'postgres'
    },
    mongo: {
      driver: 'mongo',
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
        port: 3309,
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
        port: 5435,
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
      retryWrites: true
    },
    fake_no_validation: {
      driver: 'fake',
      validations: {
        isToSetAttributes: false,
        isToValidateUnique: false,
        isToValidateNullable: false
      }
    },
    'not-found': {
      driver: 'not-found'
    },
    test: {
      driver: 'test'
    }
  }
}
