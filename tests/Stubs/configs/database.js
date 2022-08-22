export default {
  /*
  |--------------------------------------------------------------------------
  | Default Database Connection Name
  |--------------------------------------------------------------------------
  |
  | Here you may specify which of the database connections below you wish
  | to use as your default connection for all database work. Of course
  | you may use many connections at once using the Database library.
  |
  */
  default: 'postgres',

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  |
  | Here are each of the database connections setup for your application.
  | Of course, examples of configuring each database platform that is
  | supported by SecJS is shown below to make development simple.
  |
  */

  connections: {
    sqlite: {
      driver: 'sqlite',
      filename: ':memory:',
    },

    mysql: {
      driver: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'mysql',
      user: 'mysql',
      password: '12345',
    },

    postgres: {
      driver: 'postgres',
      host: 'localhost',
      port: 5433,
      database: 'postgres',
      user: 'postgres',
      password: '12345',
      debug: true,
      entities: [],
      migrations: [],
      synchronize: false,
    },

    sqlserver: {
      driver: 'sqlserver',
      host: '127.0.0.1',
      port: 1433,
      database: 'sqlserver',
      user: 'sqlserver',
      password: '12345',
    },

    mongo: {
      driver: 'mongo',
      protocol: 'mongodb',
      host: '127.0.0.1',
      port: 27017,
      database: 'mongodb',
      user: 'mongo',
      password: '12345',
      options: {
        w: 'majority',
        replicaSet: 'rs',
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Migration Repository Table
  |--------------------------------------------------------------------------
  |
  | This table keeps track of all the migrations that have already run for
  | your application. Using this information, we can determine which of
  | the migrations on disk haven't actually been run in the database.
  |
  */

  migrations: 'migrations',
}
