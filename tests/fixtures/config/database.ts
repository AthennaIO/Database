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
    }
  }
}
