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
  | supported by Athenna is shown below to make development simple.
  |
  */

  connections: {
    sqlite: {
      driver: 'sqlite',
      database: ':memory:',
      synchronize: false,
    },

    mysql: {
      driver: 'mysql',
      host: '127.0.0.1',
      port: 3307,
      user: 'root',
      password: '12345',
      database: 'athenna',
      debug: false,
    },

    postgres: {
      driver: 'postgres',
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: '12345',
      database: 'postgres',
      debug: false,
    },

    nullDriver: {
      driver: 'notImplemented',
    },

    sqlserver: {
      driver: 'sqlserver',
      host: '127.0.0.1',
      port: 1433,
      user: 'sqlserver',
      password: '12345',
      database: 'sqlserver',
    },

    mongo: {
      driver: 'mongo',
      protocol: 'mongodb',
      host: 'localhost:27017,localhost:27018,localhost:27019',
      port: 27017,
      database: 'admin',
      user: '',
      password: '',
      url: Env('DB_URL'),
      w: 'majority',
      replicaSet: 'rs',
      retryWrites: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
