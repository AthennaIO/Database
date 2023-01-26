/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { Faker } from '@faker-js/faker'
import { Collection, PaginatedResponse } from '@athenna/common'
export const DB: typeof Facade & DatabaseImpl
export const Database: typeof Facade & DatabaseImpl

export class MongoDatabaseImpl {
  /**
   * Creates a new instance of DatabaseImpl.
   *
   * @param {any} configs
   * @return {MongoDatabaseImpl}
   */
  constructor(configs?: any)

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {DatabaseImpl}
   */
  connection(connection: string): DatabaseImpl

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<this>}
   */
  connect(force?: boolean, saveOnFactory?: boolean): this

  /**
   * Verify if database is already connected.
   *
   * @return {boolean}
   */
  isConnected(): boolean

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Close all the connections with all databases.
   *
   * @return {Promise<void>}
   */
  closeAll(): Promise<void>

  /**
   * Return the client of driver.
   *
   * @return {import('mongoose').Connection | null}
   */
  getClient(): import('mongoose').Connection

  /**
   * Return the query builder of driver.
   *
   * @return {import('mongoose').Collection | null}
   */
  getQueryBuilder(): import('mongoose').Collection

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  startTransaction(): Promise<Transaction>

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  getTables(): Promise<string[]>

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  hasTable(table: string): Promise<boolean>

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  truncate(tableName: string): Promise<void>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string}
   * @return {QueryBuilder}
   */
  table(tableName: string): QueryBuilder
}

export class MySqlDatabaseImpl {
  /**
   * Creates a new instance of DatabaseImpl.
   *
   * @param {any} configs
   * @return {MySqlDatabaseImpl}
   */
  constructor(configs?: any)

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {DatabaseImpl}
   */
  connection(connection: string): DatabaseImpl

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<this>}
   */
  connect(force?: boolean, saveOnFactory?: boolean): this

  /**
   * Verify if database is already connected.
   *
   * @return {boolean}
   */
  isConnected(): boolean

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Close all the connections with all databases.
   *
   * @return {Promise<void>}
   */
  closeAll(): Promise<void>

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex | null}
   */
  getClient(): import('knex').Knex

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder | null}
   */
  getQueryBuilder(): import('knex').Knex.QueryBuilder

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  startTransaction(): Promise<Transaction>

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  runMigrations(): Promise<void>

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  revertMigrations(): Promise<void>

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  getTables(): Promise<string[]>

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  hasTable(table: string): Promise<boolean>

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  createTable(
    tableName: string,
    callback: (
      builder: import('knex').Knex.TableBuilder,
    ) => void | Promise<void>,
  ): Promise<void>

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  truncate(tableName: string): Promise<void>

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {any | Promise<any>}
   */
  raw(sql: string, bindings?: any): any | Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string}
   * @return {QueryBuilder}
   */
  table(tableName: string): QueryBuilder
}

export class PostgresDatabaseImpl {
  /**
   * Creates a new instance of DatabaseImpl.
   *
   * @param {any} configs
   * @return {PostgresDatabaseImpl}
   */
  constructor(configs?: any)

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {DatabaseImpl}
   */
  connection(connection: string): DatabaseImpl

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<this>}
   */
  connect(force?: boolean, saveOnFactory?: boolean): this

  /**
   * Verify if database is already connected.
   *
   * @return {boolean}
   */
  isConnected(): boolean

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex | null}
   */
  getClient(): import('knex').Knex

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder | null}
   */
  getQueryBuilder(): import('knex').Knex.QueryBuilder

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  startTransaction(): Promise<Transaction>

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  runMigrations(): Promise<void>

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  revertMigrations(): Promise<void>

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  getTables(): Promise<string[]>

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  hasTable(table: string): Promise<boolean>

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  createTable(
    tableName: string,
    callback: (
      builder: import('knex').Knex.TableBuilder,
    ) => void | Promise<void>,
  ): Promise<void>

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  truncate(tableName: string): Promise<void>

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {Promise<any>}
   */
  raw(sql: string, bindings?: any): any | Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string}
   * @return {QueryBuilder}
   */
  table(tableName: string): QueryBuilder
}

export class DatabaseImpl {
  /**
   * Creates a new instance of DatabaseImpl.
   *
   * @param {any} configs
   * @return {DatabaseImpl}
   */
  constructor(configs?: any)

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {MySqlDatabaseImpl|PostgresDatabaseImpl}
   */
  connection(connection: 'mongo'): MongoDatabaseImpl
  connection(connection: 'mysql'): MySqlDatabaseImpl
  connection(connection: 'postgres'): PostgresDatabaseImpl

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<this>}
   */
  connect(force?: boolean, saveOnFactory?: boolean): this

  /**
   * Verify if database is already connected.
   *
   * @return {boolean}
   */
  isConnected(): boolean

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex | null}
   */
  getClient(): import('knex').Knex

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder | null}
   */
  getQueryBuilder(): import('knex').Knex.QueryBuilder

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  startTransaction(): Promise<Transaction>

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  runMigrations(): Promise<void>

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  revertMigrations(): Promise<void>

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  getTables(): Promise<string[]>

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  hasTable(table: string): Promise<boolean>

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  createTable(
    tableName: string,
    callback: (
      builder: import('knex').Knex.TableBuilder,
    ) => void | Promise<void>,
  ): Promise<void>

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  truncate(tableName: string): Promise<void>

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {Promise<any>}
   */
  raw(sql: string, bindings?: any): any | Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string}
   * @return {QueryBuilder}
   */
  table(tableName: string): QueryBuilder
}

export class Transaction {
  /**
   * Creates a new instance of Transaction.
   *
   * @param {any} driver
   * @return {Transaction}
   */
  constructor(driver: any)

  /**
   * Commit the transaction.
   *
   * @return {Promise<void>}
   */
  commitTransaction(): Promise<void>

  /**
   * Rollback the transaction.
   *
   * @return {Promise<void>}
   */
  rollbackTransaction(): Promise<void>

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  runMigrations(): Promise<void>

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  revertMigrations(): Promise<void>

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {boolean}
   */
  hasDatabase(database: string): Promise<boolean>

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  getTables(): Promise<string[]>

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  getCurrentDatabase(): Promise<string | undefined>

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {boolean}
   */
  hasTable(table: string): Promise<boolean>

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} builder
   * @return {Promise<void>}
   */
  createTable(
    tableName: string,
    builder: (table: import('knex').Knex.TableBuilder) => void | Promise<void>,
  ): Promise<void>

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  truncate(tableName: string): Promise<void>

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {Promise<any>}
   */
  raw(sql: string, bindings?: any): any | Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string|any}
   * @return {QueryBuilder}
   */
  table(tableName: string | any): QueryBuilder
}

export class SchemaBuilder {
  /**
   * Set the table name of this schema instance.
   *
   * @return {string}
   */
  name: string

  /**
   * Set the table name of this schema instance.
   *
   * @return {string}
   */
  table: string

  /**
   * Set the db connection that this schema instance will work with.
   *
   * @return {string}
   */
  connection: string

  /**
   * Set if schema should be synchronized with database.
   *
   * @return {boolean}
   */
  synchronize: boolean

  /**
   * All the model columns mapped
   *
   * @type {any[]}
   */
  columns: any[]

  /**
   * Dictionary to specify the column name in database to class property.
   *
   * @type {Record<string, string>}
   */
  columnDictionary: Record<string, string>

  /**
   * All the model relations mapped
   *
   * @type {any[]}
   */
  relations: any[]

  /**
   * Set the connection of schema.
   *
   * @param {string} connection
   * @return {SchemaBuilder}
   */
  setConnection(connection: string): this

  /**
   * Set the schema name.
   *
   * @param name {string}
   * @return {SchemaBuilder}
   */
  setName(name: string): this

  /**
   * Set the table name.
   *
   * @param tableName {string}
   * @return {SchemaBuilder}
   */
  setTable(tableName: string): this

  /**
   * Convert the schema columns and relations to array and set.
   *
   * @param schema {any}
   */
  setSchema(schema: any): this

  /**
   * Convert to array and set the columns.
   *
   * @param columns {any}
   * @return {SchemaBuilder}
   */
  setColumns(columns: any): this

  /**
   * Convert to array and set the columns.
   *
   * @param relations {any}
   * @return {SchemaBuilder}
   */
  setRelations(relations: any): this

  /**
   * Find the relation object by name.
   *
   * @param relationName {string}
   * @return {any}
   */
  getRelationByName(relationName: string): any

  /**
   * Find the relation object by model.
   *
   * @param model {typeof import('#src/index').Model}
   * @return {any}
   */
  getRelationByModel(model: typeof Model): any

  /**
   * Find the last relation name from nested value.
   *
   * @param modelName {string}
   * @param nestedRelationNames {string[]}
   * @param callback {(query: ModelQueryBuilder) => void}
   * @return {any}
   */
  includeNestedRelations(
    modelName: string,
    nestedRelationNames: string[],
    callback?: (query: ModelQueryBuilder) => void,
  ): any

  /**
   * Set isIncluded as true in the relation.
   *
   * @param {string} modelName
   * @param {string} relationName
   * @param {any} callback
   * @return {any}
   */
  includeRelation(
    modelName: string,
    relationName: string,
    callback?: (query: ModelQueryBuilder) => void,
  ): any

  /**
   * Include nested has relations.
   *
   * @param modelName {string}
   * @param nestedRelationNames {string}
   * @param lastCallback {any}
   * @param operation {string}
   * @param count {number}
   * @return {any}
   */
  includeNestedHasRelations(
    modelName: string,
    nestedRelationNames: string,
    lastCallback: (query: ModelQueryBuilder) => void | undefined,
    operation: string,
    count: number,
  ): any

  /**
   * Set isIncluded as true as the has map in the relation.
   *
   * @param {string} modelName
   * @param {string} relationName
   * @param {any} callback
   * @param {string} operation
   * @param {number} count
   * @return {any}
   */
  includeHasRelation(
    modelName: string,
    relationName: string,
    callback: (query: ModelQueryBuilder) => void | undefined,
    operation: string,
    count: number,
  ): any

  /**
   * Get all available relations as string or null..
   *
   * @return {string|null}
   */
  getAvailableRelationsString(): string | null

  /**
   * Verify if schema has timestamp properties.
   *
   * @return {boolean}
   */
  hasTimestamp(): boolean

  /**
   * Verify if schema has created at property.
   *
   * @return {boolean}
   */
  hasCreatedAt(): boolean

  /**
   * Verify if schema has updated at property.
   *
   * @return {boolean}
   */
  hasUpdatedAt(): boolean

  /**
   * Verify if schema has deleted at property.
   *
   * @return {boolean}
   */
  hasDeletedAt(): boolean

  /**
   * Get the created at column name.
   *
   * @return {string}
   */
  getCreatedAt(): string

  /**
   * Get the created at column name.
   *
   * @return {string}
   */
  getUpdatedAt(): string

  /**
   * Get the deleted at column name.
   *
   * @return {string}
   */
  getDeletedAt(): string

  /**
   * Get all the relations that has the "isIncluded"
   * property as true.
   *
   * @return {any[]}
   */
  getIncludedRelations(): any[]

  /**
   * Get the column dictionary.
   *
   * @return {any}
   */
  getColumnDictionary(): any

  /**
   * Get the column name of a reversed column name.
   *
   * @param reversedColumnName {string}
   * @return {string}
   */
  getColumnNameOf(reversedColumnName: string): string

  /**
   * Get the column names of a reversed columns.
   *
   * @param reversedColumns {string[]}
   * @return {string[]}
   */
  getColumnNamesOf(reversedColumns: string[]): string[]

  /**
   * Return an object statement with keys.
   *
   * @param reversedStatement {any}
   * @return {any}
   */
  getStatementNamesOf(reversedStatement: any): any

  /**
   * Get the column dictionary reversed.
   *
   * @return {any}
   */
  getReversedColumnDictionary(): any

  /**
   * Get the reverse column name of a column name.
   *
   * @param columnName {string}
   * @return {string}
   */
  getReversedColumnNameOf(columnName: string): string

  /**
   * Get the reverse column names of a columns.
   *
   * @param columns {string[]}
   * @return {string[]}
   */
  getReversedColumnNamesOf(columns: string[]): string[]

  /**
   * Return an object statement with reversed keys.
   *
   * @param statement {any}
   * @return {any}
   */
  getReversedStatementNamesOf(statement: any): any
}

export class ModelFactory<T = any> {
  /**
   * The model that we are going to use to generate
   * data.
   *
   * @type {any}
   */
  Model: T

  /**
   * Set the returning key that this factory will return.
   *
   * @type {string|null}
   */
  returning: string

  /**
   * Creates a new instance of ModelFactory.
   *
   * @param Model {any}
   * @param returning {string}
   * @return {ModelFactory}
   */
  constructor(Model: T, returning?: string)

  /**
   * Set the number of models to be created
   *
   * @param number
   * @return {ModelFactory}
   */
  count(number: number): this

  /**
   * Set the soft delete state in your model to
   * fabricate deleted data.
   *
   * @return {ModelFactory}
   */
  trashed(): this

  /**
   * Remove the soft delete state in your model to
   * not fabricate deleted data.
   *
   * @return {ModelFactory}
   */
  untrashed(): this

  /**
   * Make models without creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   */
  make(override?: any, asArrayOnOne?: boolean): Promise<T | T[]>

  /**
   * Create models creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   * @return {any | any[]}
   */
  create(override?: any, asArrayOnOne?: boolean): Promise<T | T[]>
}

export class ModelGenerator {
  /**
   * Creates a new instance of ModelGenerator.
   *
   * @param Model {Model}
   * @param schema {SchemaBuilder}
   * @return {ModelGenerator}
   */
  constructor(Model: Model, schema: SchemaBuilder)

  /**
   * Generate one model instance with relations loaded.
   *
   * @param data {any}
   * @return {Promise<Model>}
   */
  generateOne(data: any): Promise<Model>

  /**
   * Generate models instances with relations loaded.
   *
   * @param data {any[]}
   * @return {Promise<Model[]>}
   */
  generateMany(data: any[]): Promise<Model[]>

  /**
   * Include one relation to model.
   *
   * @param model {Model}
   * @param relation {any}
   * @return {Promise<Model>}
   */
  includeRelation(model: Model, relation: any): Promise<Model>

  /**
   * Include relations to model.
   *
   * @param model {Model}
   * @param relations {any[]}
   * @return {Promise<Model>}
   */
  includeRelations(model: Model, relations: any[]): Promise<Model>
}

export class Model {
  /**
   * The faker instance to create fake data.
   *
   * @type {Faker}
   */
  static faker: Faker

  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection(): string

  /**
   * Set the table name of this model instance.
   *
   * @return {string}
   */
  static get table(): string

  /**
   * Set the primary key of your model.
   *
   * @return {string}
   */
  static get primaryKey(): string

  /**
   * Set the default attributes of your model.
   *
   * @return {Record<screen, any>}
   */
  static get attributes(): Record<string, any>

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly(): string[]

  /**
   * Return a boolean specifying if Model will use soft delete.
   *
   *  @return {boolean}
   */
  static get isSoftDelete(): boolean

  /**
   * Return the DELETED_AT column name in database.
   *
   *  @return {string}
   */
  static get DELETED_AT(): string

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema(): any

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static definition(): any

  /**
   * Return the criterias set to this model.
   *
   * @return {Record<string, Criteria>}
   */
  static criterias(): Record<string, Criteria>

  /**
   * Get the model criterias merging the criterias property
   * with runtime added criterias.
   *
   * @return {Record<string, Criteria>}
   */
  static getCriterias(): Record<string, Criteria>

  /**
   * Set a new criteria in the model.
   *
   * @param name {string}
   * @param criteria {Map<string, any[]>|Criteria}
   * @return {typeof Model}
   */
  static addCriteria(name: string, criteria: Criteria): typeof Model
  static addCriteria(name: string, criteria: Map<string, any[]>): typeof Model

  /**
   * Remove a criteria from the model.
   *
   * @param name {string}
   * @return {typeof Model}
   */
  static removeCriteria(name: string): typeof Model

  /**
   * Create the factory object to generate data.
   *
   * @return {ModelFactory}
   */
  static factory<Class extends typeof Model>(
    this: Class,
    returning?: string,
  ): ModelFactory<InstanceType<Class>>

  /**
   * The schema instance of this model.
   *
   * @return {SchemaBuilder}
   */
  static getSchema(): SchemaBuilder

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex}
   */
  static getClient(): import('knex').Knex

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  static getQueryBuilder(): import('knex').Knex.QueryBuilder

  /**
   * Create a new model query builder.
   *
   * @param [withCriterias] {boolean}
   * @return {ModelQueryBuilder}
   */
  static query<Class extends typeof Model>(
    this: Class,
    withCriterias?: boolean,
  ): ModelQueryBuilder<InstanceType<Class>>

  /**
   * Truncate all data in database of this model.
   *
   * @return {Promise<void>}
   */
  static truncate(): Promise<void>

  /**
   * Count the number of matches with where in database.
   *
   * @param {any} [where]
   * @return {Promise<number>}
   */
  static count(where?: any): Promise<void>

  /**
   * Get one data in DB and return as a subclass instance or
   * throw exception if undefined.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>>}
   */
  static findOrFail<Class extends typeof Model>(
    this: Class,
    where?: any,
  ): Promise<InstanceType<Class>>

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @param where {any}
   * @param callback {() => Promise<any>}
   * @return {Promise<any>}
   */
  static findOr<Class extends typeof Model>(
    this: Class,
    where?: any,
    callback?: () => Promise<any>,
  ): Promise<InstanceType<Class>>

  /**
   * Get one data in DB and return as a subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>>}
   */
  static find<Class extends typeof Model>(
    this: Class,
    where?: any,
  ): Promise<InstanceType<Class>>

  /**
   * Get many data in DB and return as an array of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>[]>}
   */
  static findMany<Class extends typeof Model>(
    this: Class,
    where?: any,
  ): Promise<InstanceType<Class>[]>

  /**
   * Get many data in DB and return as a collection of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<Collection<InstanceType<Class>>>}
   */
  static collection<Class extends typeof Model>(
    this: Class,
    where?: any,
  ): Promise<Collection<InstanceType<Class>>>

  /**
   * Find many models in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<{
   *   data: InstanceType<this>[],
   *   meta: {
   *     totalItems: number,
   *     itemsPerPage: number,
   *     totalPages: number,
   *     currentPage: number,
   *     itemCount: number,
   *   },
   *   links: {
   *     next: string,
   *     previous: string,
   *     last: string,
   *     first: string
   *   }
   * }>}
   */
  static paginate<Class extends typeof Model>(
    this: Class,
    page?: number,
    limit?: number,
    resourceUrl?: string,
  ): Promise<PaginatedResponse>

  /**
   * Create a new model in DB and return as a subclass instance.
   *
   * @param {any} data
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<InstanceType<this>>}
   */
  static create<Class extends typeof Model>(
    this: Class,
    data?: any,
    ignorePersistOnly?: boolean,
  ): Promise<InstanceType<Class>>

  /**
   * Create many models in DB and return as subclass instances.
   *
   * @param {any[]} data
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<InstanceType<this>[]>}
   */
  static createMany<Class extends typeof Model>(
    this: Class,
    data?: any[],
    ignorePersistOnly?: boolean,
  ): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Create or update models in DB and return as subclass instances.
   *
   * @param {any} where
   * @param {any} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this> | InstanceType<this>[]>}
   */
  static createOrUpdate<Class extends typeof Model>(
    this: Class,
    where?: any,
    data?: any,
    ignorePersistOnly?: boolean,
  ): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Update a model in DB and return as a subclass instance.
   *
   * @param {any} where
   * @param {any} [data]
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<InstanceType<this>|InstanceType<this>[]>}
   */
  static update<Class extends typeof Model>(
    this: Class,
    where: any,
    data?: any,
    ignorePersistOnly?: boolean,
  ): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Delete a model in DB and return as a subclass instance or void.
   *
   * @param {any} where
   * @param {boolean} [force]
   * @return {Promise<InstanceType<this>|void>}
   */
  static delete<Class extends typeof Model>(
    this: Class,
    where: any,
    force?: boolean,
  ): Promise<InstanceType<Class> | void>

  /**
   * Creates a new instance of your model.
   *
   * @param [isFromDatabase] {boolean}
   */
  constructor(isFromDatabase?: boolean)

  /**
   * Creates a new has one query builder.
   *
   * @param {typeof Model} RelationModel
   * @param {boolean} [withCriterias]
   * @return {HasOneQueryBuilder}
   */
  hasOne(
    RelationModel: typeof Model,
    withCriterias?: boolean,
  ): HasOneQueryBuilder<InstanceType<typeof RelationModel>>

  /**
   * Creates a new has many query builder.
   *
   * @param {typeof Model} RelationModel
   * @param {boolean} [withCriterias]
   * @return {HasManyQueryBuilder}
   */
  hasMany(
    RelationModel: typeof Model,
    withCriterias?: boolean,
  ): HasManyQueryBuilder<InstanceType<typeof RelationModel>>

  /**
   * Creates a new belongs to query builder.
   *
   * @param {typeof Model} RelationModel
   * @param {boolean} [withCriterias]
   * @return {BelongsToQueryBuilder}
   */
  belongsTo(
    RelationModel: typeof Model,
    withCriterias?: boolean,
  ): BelongsToQueryBuilder<InstanceType<typeof RelationModel>>

  /**
   * Creates a new belongs to many query builder.
   *
   * @param {typeof Model} RelationModel
   * @param {boolean} [withCriterias]
   * @return {BelongsToManyQueryBuilder}
   */
  belongsToMany(
    RelationModel: typeof Model,
    withCriterias?: boolean,
  ): BelongsToManyQueryBuilder<InstanceType<typeof RelationModel>>

  /**
   * Return a Json object from the actual subclass instance.
   *
   * @return {any|any[]}
   */
  toJSON(): any | any[]

  /**
   * Return the model resource.
   *
   * @param [criterias] {any}
   * @return {any|any[]}
   */
  toResource(criterias?: any): any | any[]

  /**
   * Load a relation in your model.
   *
   * @param relationName {string}
   * @param callback {(query: ModelQueryBuilder) => void}
   * @return {Promise<Model>}
   */
  load(
    relationName: string,
    callback?: (
      query: ModelQueryBuilder,
    ) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>,
  ): Promise<Model>

  /**
   * Update the model values that have been modified.
   *
   * @return {Promise<this>}
   */
  save(): Promise<this>

  /**
   * Delete or soft delete your model from database.
   *
   * @param {boolean} force
   * @return {Promise<this | void>}
   */
  delete(force?: boolean): Promise<this | void>

  /**
   * Restore a soft deleted model from database.
   *
   * @return {Promise<this>}
   */
  restore(): Promise<this>

  /**
   * Verify if model is soft deleted.
   *
   * @return {boolean}
   */
  isTrashed(): boolean

  /**
   * Re-retrieve the model from the database. The existing
   * model instance will not be affected.
   *
   * @return {Promise<this>}
   */
  fresh(): Promise<this>

  /**
   * Re-retrieve the model from the database. The existing
   * model instance will be affected.
   *
   * @return {Promise<this>}
   */
  refresh(): Promise<this>
}

export class Column {
  /**
   * Create an auto incremented integer primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('integer').isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedInt(name?: string): any

  /**
   * Create an auto incremented uuid primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('uuid').isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedUuid(name?: string): any

  /**
   * Create an auto incremented object id primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('objectId').isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedObjectId(name?: string): any

  /**
   * Create a "string" column.
   *
   * This method is an alias for:
   * @example Column.type('varchar').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {string|number} [length]
   */
  static string(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          length?: string | number
          default?: any
          enu?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
    length?: number,
  ): any

  /**
   * Create a "uuid" column.
   *
   * This method is an alias for:
   * @example Column.type('uuid').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {string|number} [length]
   */
  static uuid(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          length?: string | number
          default?: any
          enu?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
    length?: number,
  ): any

  /**
   * Create an "enum" column.
   *
   * This method is an alias for:
   * @example Column.type('enum').enu(values).get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {any} [values]
   */
  static enum(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          length?: string | number
          default?: any
          enu?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
    values?: any,
  ): any

  /**
   * Create an "integer" column.
   *
   * This method is an alias for:
   * @example Column.type('integer').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   */
  static integer(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          scale?: number
          precision?: number
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "float" column.
   *
   * This method is an alias for:
   * @example Column.type('float').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static float(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          scale?: number
          precision?: number
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "double" column.
   *
   * This method is an alias for:
   * @example Column.type('double').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static double(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          scale?: number
          precision?: number
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "numeric" column.
   *
   * This method is an alias for:
   * @example Column.type('numeric').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {number} [scale]
   * @param {number} [precision]
   * @return {any}
   */
  static numeric(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          scale?: number
          precision?: number
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
    scale?: number,
    precision?: number,
  ): any

  /**
   * Create a "decimal" column.
   *
   * This method is an alias for:
   * @example Column.type('decimal').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @param {number} [scale]
   *  @param {number} [precision]
   *  @return {any}
   */
  static decimal(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          scale?: number
          precision?: number
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
    scale?: number,
    precision?: number,
  ): any

  /**
   * Create a "json" column.
   *
   * This method is an alias for:
   * @example Column.type('json').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static json(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "jsonb" column.
   *
   * This method is an alias for:
   * @example Column.type('jsonb').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static jsonb(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "date" column.
   *
   * This method is an alias for:
   * @example Column.type('date').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static date(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "datetime" column.
   *
   * This method is an alias for:
   * @example Column.type('datetime').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static datetime(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "timestamp" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').get()
   *
   * @param {string|{
   *  type?: import('knex').Knex.TableBuilder,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static timestamp(
    optionsOrName?:
      | string
      | {
          type?: import('knex').Knex.TableBuilder
          name?: string
          default?: any
          isHidden?: boolean
          isPrimary?: boolean
          isUnique?: boolean
          isNullable?: boolean
        },
  ): any

  /**
   * Create a "createdAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static createdAt(name?: string): any

  /**
   * Create a "updatedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static updatedAt(name?: string): any

  /**
   * Create a "deletedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static deletedAt(name?: string): any

  /**
   * Set the type of your column.
   *
   * @param {import('knex').Knex.TableBuilder} type
   * @return {typeof Column}
   */
  static type(type: import('knex').Knex.TableBuilder): typeof Column

  /**
   * Set the real name of your column.
   *
   * @param {string} name
   * @return {typeof Column}
   */
  static name(name: string): typeof Column

  /**
   * Set the default value of your column.
   *
   * @param {any} value
   * @return {typeof Column}
   */
  static default(value: any): typeof Column

  /**
   * Set the length of your column.
   *
   * @param {string|number} length
   * @return {typeof Column}
   */
  static length(length: string | number): typeof Column

  /**
   * Set the enum of your column.
   *
   * @param {any} enu
   * @return {typeof Column}
   */
  static enu(enu: any): typeof Column

  /**
   * Set the scale of your column.
   *
   * @param {number} scale
   * @return {typeof Column}
   */
  static scale(scale: number): typeof Column

  /**
   * Set the precision of your column.
   *
   * @param {number} precision
   * @return {typeof Column}
   */
  static precision(precision: number): typeof Column

  /**
   * Set if this column should be created date.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isCreateDate(is?: boolean): typeof Column

  /**
   * Set if this column should be updated date.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isUpdateDate(is?: boolean): typeof Column

  /**
   * Set if this column should be deleted date.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isDeleteDate(is?: boolean): typeof Column

  /**
   * Set if this column should be hided.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isHidden(is?: boolean): typeof Column

  /**
   * Set if your column is primary.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isPrimary(is?: boolean): typeof Column

  /**
   * Set if your column is unique.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isUnique(is?: boolean): typeof Column

  /**
   * Set if your column is nullable.
   *
   * @param {boolean} [is]
   * @return {typeof Column}
   */
  static isNullable(is?: boolean): typeof Column

  /**
   * Get the clean object built.
   *
   * @return {any}
   */
  static get(): any
}

export class Relation {
  /**
   * Create a hasOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('hasOne').inverseSide(inverseSide).get()
   *
   * @param model {any}
   * @param inverseSide {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static hasOne(model: Model, inverseSide: string, cascade?: boolean): any

  /**
   * Create a hasMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('hasMany').inverseSide(inverseSide).get()
   *
   * @param model {any}
   * @param inverseSide {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static hasMany(model: Model, inverseSide: string, cascade?: boolean): any

  /**
   * Create a belongsTo relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('belongsTo').inverseSide(inverseSide).get()
   *
   * @param model {any}
   * @param inverseSide {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static belongsTo(model: Model, inverseSide: string, cascade?: boolean): any

  /**
   * Create a belongsToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.model(model).type('belongsToMany').inverseSide(inverseSide).get()
   *
   * @param model {any}
   * @param inverseSide {string}
   * @param pivotTable {string}
   * @param cascade {boolean}
   * @return {any}
   */
  static belongsToMany(
    model: Model,
    inverseSide: string,
    pivotTable?: string,
    cascade?: boolean,
  ): any

  /**
   * Set the target model that your relation is pointing.
   *
   * @param model {typeof Model}
   * @return {typeof Relation}
   */
  static model(model: typeof Model): typeof Relation

  /**
   * Set the relation type.
   *
   * @param type {"hasOne","hasMany","belongsTo","belongsToMany"}
   * @return {typeof Relation}
   */
  static type(
    type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany',
  ): typeof Relation

  /**
   * Set the inverse side of your model schema.
   *
   * @param name
   * @return {typeof Relation}
   */
  static inverseSide(name: string): typeof Relation

  /**
   * Set the pivot table of the relation.
   *
   * @param tableName {string}
   * @return {typeof Relation}
   */
  static pivotTable(tableName: string): typeof Relation

  /**
   * Set the pivot local foreign key of the relation.
   *
   * @param foreignKey {string}
   * @return {typeof Relation}
   */
  static pivotLocalForeignKey(foreignKey: string): typeof Relation

  /**
   * Set the pivot relation foreign key of the relation.
   *
   * @param foreignKey {string}
   * @return {typeof Relation}
   */
  static pivotRelationForeignKey(foreignKey: string): typeof Relation

  /**
   * Set the foreign key of the relation.
   *
   * @param columnName {string}
   * @return {typeof Relation}
   */
  static foreignKey(columnName: string): typeof Relation

  /**
   * Set if relation should be cascaded on delete/update.
   *
   * @return {typeof Relation}
   */
  static cascade(): typeof Relation

  /**
   * Get the clean object built.
   *
   * @return {any}
   */
  static get(): any
}

export class DriverFactory {
  /**
   * Return all available drivers.
   *
   * @param {boolean} onlyConnected
   * @return {string[]}
   */
  static availableDrivers(onlyConnected?: boolean): string[]

  /**
   * Fabricate a new connection with some database driver.
   *
   * @param {string} connectionName
   * @return {{ Driver: any, clientConnection?: any }}
   */
  static fabricate(connectionName: string): {
    Driver: any
    clientConnection?: any
  }

  /**
   * Create a new driver implementation.
   *
   * @param {string} name
   * @param {any} driver
   */
  static createDriver(name: string, driver: any): void

  /**
   * Create the connection with database by driver name.
   *
   * @param {string} driverName
   * @param {string} [conName]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static createConnectionByDriver(
    driverName: string,
    conName?: string,
    saveOnDriver?: boolean,
  ): Promise<any>

  /**
   * Close the connection with database by driver name.
   *
   * @param {string} driverName
   * @return {Promise<void>}
   */
  static closeConnectionByDriver(driverName: string): Promise<void>

  /**
   * Create the connection with database by connection name.
   *
   * @param {string} [conName]
   * @param {boolean} [saveOnDriver]
   * @return {Promise<any>}
   */
  static createConnectionByName(
    conName?: string,
    saveOnDriver?: boolean,
  ): Promise<any>

  /**
   * Close the connection with database by connection name.
   *
   * @param {string} [conName]
   * @return {Promise<void>}
   */
  static closeConnectionByName(conName?: string): Promise<void>
}

export class Migration {
  /**
   * Define the database connection to run the migration.
   *
   * @return {string}
   */
  static get connection(): string

  /**
   * Run the migrations.
   *
   * @return {Promise<void>}
   */
  up(knex: import('knex').Knex): Promise<void>

  /**
   * Reverse the migrations.
   *
   * @return {Promise<void>}
   */
  down(knex: import('knex').Knex): Promise<void>
}

export class Seeder {
  /**
   * Run the database seeders.
   *
   * @return {void|Promise<void>}
   */
  run(): void | Promise<void>
}

export class Resource {
  /**
   * Set your object blueprint to execute in resources.
   *
   * @param object
   * @return {any}
   */
  static blueprint(object: any): any

  /**
   * Parse model to resource.
   *
   * @param object {any}
   * @return {null|any}
   */
  static toJson(object): null | any[]

  /**
   * Parse objects to resource.
   *
   * @param objects {any[]}
   * @return {null|any[]}
   */
  static toArray(objects: any[]): null | any[]
}

export class DatabaseLoader {
  /**
   * Return all commands from database package.
   *
   * @return {any[]}
   */
  static loadCommands(): any[]

  /**
   * Return all custom templates from database package.
   *
   * @return {any[]}
   */
  static loadTemplates(): any[]
}

/**
 * Query Builders
 */

export class QueryBuilder {
  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex}
   */
  getClient(): import('knex').Knex

  /**
   * Return the query builder of driver.
   *
   * @return {import('knex').Knex.QueryBuilder}
   */
  getQueryBuilder(): import('knex').Knex.QueryBuilder

  /**
   * Set a query builder in driver.
   *
   * @param {any} queryBuilder
   * @return {QueryBuilder}
   */
  setQueryBuilder(queryBuilder: any): this

  /**
   * Calculate the average of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  avg(columnName: string): Promise<number>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  avgDistinct(columnName: string): Promise<number>

  /**
   * Get the max number of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  max(columnName: string): Promise<number>

  /**
   * Get the min number of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  min(columnName: string): Promise<number>

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  sum(columnName: string): Promise<number>

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} columnName
   * @return {Promise<number>}
   */
  sumDistinct(columnName: string): Promise<number>

  /**
   * Increment a value of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number | number[]>}
   */
  increment(columnName: string): Promise<number | number[]>

  /**
   * Decrement a value of a given column.
   *
   * @param {string} columnName
   * @return {Promise<number | number[]>}
   */
  decrement(columnName: string): Promise<number | number[]>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} [columnName]
   * @return {Promise<number>}
   */
  count(columnName?: string): Promise<number>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} [columnName]
   * @return {Promise<number>}
   */
  countDistinct(columnName?: string): Promise<number>

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  findOrFail(): Promise<any>

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @param callback {() => Promise<any>}
   * @return {Promise<any>}
   */
  findOr(callback: () => Promise<any>): Promise<any>

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  find(): Promise<any>

  /**
   * Find many values in database.
   *
   * @return {Promise<any[]>}
   */
  findMany(): Promise<any[]>

  /**
   * Find many values in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  collection(): Promise<import('@athenna/common').Collection>

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {}
   */
  paginate(
    page?: number,
    limit?: number,
    resourceUrl?: string,
  ): Promise<import('@athenna/common').PaginatedResponse>

  /**
   * Create a value in database.
   *
   * @param {any} [data]
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  create(data?: any, primaryKey?: string): Promise<any>

  /**
   * Create many values in database.
   *
   * @param {any[]} [data]
   * @param {string} [primaryKey]
   * @return {Promise<any[]>}
   */
  createMany(data?: any[], primaryKey?: string): Promise<any[]>

  /**
   * Create data or update if already exists.
   *
   * @param {any} [data]
   * @param {string} [primaryKey]
   * @return {Promise<any | any[]>}
   */
  createOrUpdate(data?: any, primaryKey?: string): Promise<any | any[]>

  /**
   * Update data in database.
   *
   * @param {any} [data]
   * @return {Promise<any | any[]>}
   */
  update(data?: any): Promise<any | any[]>

  /**
   * Delete data in database.
   *
   * @return {Promise<any | void>}
   */
  delete(): Promise<any | void>

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {any | Promise<any>}
   */
  raw(sql: string, bindings?: any): any | Promise<any>

  /**
   * Set a new table to work with in query builder.
   *
   * @param tableName {string}
   * @return {QueryBuilder}
   */
  table(tableName: string): this

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: this, criteriaValue: any) => void}
   */
  when(criteria: any, callback: (query: this, criteriaValue: any) => void): this

  /**
   * Log in console the actual query built.
   *
   * @return {QueryBuilder}
   */
  dump(): this

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  select(...columns: string[]): this

  /**
   * Set the columns that should be selected on query raw.
   *
   * @param sql {string}
   * @param bindings {any}
   * @return {QueryBuilder}
   */
  selectRaw(sql: string, bindings?: any): this

  /**
   * Set a join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  join(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  join(tableName: string, column1: string, column2: string): this
  join(tableName: string, clause: import('knex').Knex.JoinCallback): this
  join(tableName: string): this

  /**
   * Set a left join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  leftJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  leftJoin(tableName: string, column1: string, column2: string): this
  leftJoin(tableName: string, clause: import('knex').Knex.JoinCallback): this

  /**
   * Set a right join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  rightJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  rightJoin(tableName: string, column1: string, column2: string): this
  rightJoin(tableName: string, clause: import('knex').Knex.JoinCallback): this

  /**
   * Set a cross join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  crossJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  crossJoin(tableName: string, column1: string, column2: string): this
  crossJoin(tableName: string, clause: import('knex').Knex.JoinCallback): this
  crossJoin(tableName: string): this

  /**
   * Set a full outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  fullOuterJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  fullOuterJoin(tableName: string, column1: string, column2: string): this
  fullOuterJoin(
    tableName: string,
    clause: import('knex').Knex.JoinCallback,
  ): this

  /**
   * Set a left outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  leftOuterJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  leftOuterJoin(tableName: string, column1: string, column2: string): this
  leftOuterJoin(
    tableName: string,
    clause: import('knex').Knex.JoinCallback,
  ): this

  /**
   * Set a right outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {QueryBuilder}
   */
  rightOuterJoin(
    tableName: string,
    column1: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    column2: string,
  ): this
  rightOuterJoin(tableName: string, column1: string, column2: string): this
  rightOuterJoin(
    tableName: string,
    clause: import('knex').Knex.JoinCallback,
  ): this

  /**
   * Set a join raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  joinRaw(sql: string, bindings?: any): this

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  groupBy(...columns: string[]): this

  /**
   * Set a group by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  groupByRaw(sql: string, bindings?: any): this

  /**
   * Set a having statement in your query.
   *
   * @return {QueryBuilder}
   */
  having(clause: (query: this) => void): this
  having(columnName: string, value: any): this
  having(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): this

  /**
   * Set a having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  havingRaw(sql: string, bindings?: any): this

  /**
   * Set a having exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  havingExists(builder: this): this

  /**
   * Set a having not exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  havingNotExists(builder: this): this

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  havingIn(columnName: string, values: any[]): this

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  havingNotIn(columnName: string, values: any[]): this

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  havingBetween(columnName: string, values: [any, any]): this

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  havingNotBetween(columnName: string, values: [any, any]): this

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  havingNull(columnName: string): this

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  havingNotNull(columnName: string): this

  /**
   * Set an or having statement in your query.
   *
   * @return {QueryBuilder}
   */
  orHaving(clause: (query: this) => void): this
  orHaving(columnName: string, value: any): this
  orHaving(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): this

  /**
   * Set an or having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  orHavingRaw(sql: string, bindings?: any): this

  /**
   * Set an or having exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  orHavingExists(builder: this): this

  /**
   * Set an or having not exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  orHavingNotExists(builder: this): this

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orHavingIn(columnName: string, values: any[]): this

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orHavingNotIn(columnName: string, values: any[]): this

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orHavingBetween(columnName: string, values: [any, any]): this

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orHavingNotBetween(columnName: string, values: [any, any]): this

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orHavingNull(columnName: string): this

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orHavingNotNull(columnName: string): this

  /**
   * Set a where statement in your query.
   *
   * @return {QueryBuilder}
   */
  where(clause: (query: this) => void): this
  where(statement: Record<string, any>): this
  where(columnName: string, value: any): this
  where(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): this

  /**
   * Set a where not statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereNot(clause: (query: this) => void): this
  whereNot(statement: Record<string, any>): this
  whereNot(columnName: string, value: any): this

  /**
   * Set a where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  whereRaw(sql: string, bindings?: any): this

  /**
   * Set a where exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereExists(builder: this): this

  /**
   * Set a where not exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereNotExists(builder: this): this

  /**
   * Set a where like statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereLike(clause: (query: this) => void): this
  whereLike(statement: Record<string, any>): this
  whereLike(columnName: string, value: any): this

  /**
   * Set a where ILike statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereILike(clause: (query: this) => void): this
  whereILike(statement: Record<string, any>): this
  whereILike(columnName: string, value: any): this

  /**
   * Set a where in statement in your query.
   *
   * @return {QueryBuilder}
   */
  whereIn(columnName: string, values: any[]): this

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  whereNotIn(columnName: string, values: any[]): this

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  whereBetween(columnName: string, values: [any, any]): this

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  whereNotBetween(columnName: string, values: [any, any]): this

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  whereNull(columnName: string): this

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  whereNotNull(columnName: string): this

  /**
   * Set an or where statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhere(clause: (query: this) => void): this
  orWhere(statement: Record<string, any>): this
  orWhere(columnName: string, value: any): this
  orWhere(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): this

  /**
   * Set a or where not statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereNot(clause: (query: this) => void): this
  orWhereNot(statement: Record<string, any>): this
  orWhereNot(columnName: string, value: any): this

  /**
   * Set an or where statement in your query.
   *
   * @param sql {string}
   * @param bindings {any}
   * @return {QueryBuilder}
   */
  orWhereRaw(sql: string, bindings?: any): this

  /**
   * Set an or where exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereExists(builder: this): this

  /**
   * Set an or where not exists statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereNotExists(builder: this): this

  /**
   * Set an or where like statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereLike(clause: (query: this) => void): this
  orWhereLike(statement: Record<string, any>): this
  orWhereLike(columnName: string, value: any): this

  /**
   * Set an or where ILike statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereILike(clause: (query: this) => void): this
  orWhereILike(statement: Record<string, any>): this
  orWhereILike(columnName: string, value: any): this

  /**
   * Set an or where in statement in your query.
   *
   * @return {QueryBuilder}
   */
  orWhereIn(columnName: string, values: any[]): this

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  orWhereNotIn(columnName: string, values: any[]): this

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orWhereBetween(columnName: string, values: [any, any]): this

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  orWhereNotBetween(columnName: string, values: [any, any]): this

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orWhereNull(columnName: string): this

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  orWhereNotNull(columnName: string): this

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {QueryBuilder}
   */
  orderBy(columnName: string, direction: 'asc' | 'desc' | 'ASC' | 'DESC'): this

  /**
   * Set an order by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {QueryBuilder}
   */
  orderByRaw(sql: string, bindings?: any): this

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {QueryBuilder}
   */
  latest(columnName?: string): this

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {QueryBuilder}
   */
  oldest(columnName?: string): this

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  offset(number: number): this

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  limit(number: number): this
}

export class Criteria {
  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {typeof Criteria}
   */
  static table(tableName: string | any): typeof Criteria

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: QueryBuilder, criteriaValue: any) => void}
   */
  static when(
    criteria: any,
    callback: (query: ModelQueryBuilder, criteriaValue: any) => void,
  ): typeof Criteria

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {typeof Criteria}
   */
  static select(...columns: string[]): typeof Criteria

  /**
   * Get all the records even the soft deleted.
   *
   * @return {typeof Criteria}
   */
  static withTrashed(): typeof Criteria

  /**
   * Get only the soft deleted values from database.
   *
   * @return {typeof Criteria}
   */
  static onlyTrashed(): typeof Criteria

  /**
   * Eager load a relation in your query.
   *
   * @param relationName {string}
   * @param [callback] {any}
   * @return {typeof Criteria}
   */
  static with(
    relationName: string,
    callback?: (
      query: ModelQueryBuilder,
    ) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>,
  ): typeof Criteria

  /**
   * Set a has statement in your query.
   *
   * @param relationName {string}
   * @param [operation] {string}
   * @param [count] {number}
   * @return {typeof Criteria}
   */
  static has(
    relationName: string,
    operation?: string,
    count?: number,
  ): typeof Criteria

  /**
   * Set a where has statement in your query.
   *
   * @param relationName {string}
   * @param [callback] {(query: ModelQueryBuilder) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>}
   * @param [operation] {string}
   * @param [count] {number}
   * @return {typeof Criteria}
   */
  static whereHas(
    relationName: string,
    callback?: (
      query: ModelQueryBuilder,
    ) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>,
    operation?: string,
    count?: number,
  ): typeof Criteria

  /**
   * Set a where statement in your query.
   *
   * @return {typeof Criteria}
   */
  static where(clause: (query: QueryBuilder) => void): typeof Criteria
  static where(statement: Record<string, any>): typeof Criteria
  static where(columnName: string, value: any): typeof Criteria
  static where(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): typeof Criteria

  /**
   * Set a where not statement in your query.
   *
   * @return {typeof Criteria}
   */
  static whereNot(clause: (query: QueryBuilder) => void): typeof Criteria
  static whereNot(statement: Record<string, any>): typeof Criteria
  static whereNot(columnName: string, value: any): typeof Criteria

  /**
   * Set a where exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static whereExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set a where not exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static whereNotExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set a where like statement in your query.
   *
   * @return {typeof Criteria}
   */
  static whereLike(clause: (query: QueryBuilder) => void): typeof Criteria
  static whereLike(statement: Record<string, any>): typeof Criteria
  static whereLike(columnName: string, value: any): typeof Criteria

  /**
   * Set a where ILike statement in your query.
   *
   * @return {typeof Criteria}
   */
  static whereILike(clause: (query: QueryBuilder) => void): typeof Criteria
  static whereILike(statement: Record<string, any>): typeof Criteria
  static whereILike(columnName: string, value: any): typeof Criteria

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static whereIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static whereNotIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static whereNull(columnName: string): typeof Criteria

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static whereNotNull(columnName: string): typeof Criteria

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static whereBetween(columnName: string, values: [any, any]): typeof Criteria

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static whereNotBetween(
    columnName: string,
    values: [any, any],
  ): typeof Criteria

  /**
   * Set a or where statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orWhere(clause: (query: QueryBuilder) => void): typeof Criteria
  static orWhere(statement: Record<string, any>): typeof Criteria
  static orWhere(columnName: string, value: any): typeof Criteria
  static orWhere(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): typeof Criteria

  /**
   * Set a or where not statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orWhereNot(clause: (query: QueryBuilder) => void): typeof Criteria
  static orWhereNot(statement: Record<string, any>): typeof Criteria
  static orWhereNot(columnName: string, value: any): typeof Criteria

  /**
   * Set an or where exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orWhereExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set an or where not exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orWhereNotExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {typeof Criteria}
   */
  static orderBy(
    columnName: string,
    direction?: 'asc' | 'desc' | 'ASC' | 'DESC',
  ): typeof Criteria

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static latest(columnName?: string): typeof Criteria

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static oldest(columnName?: string): typeof Criteria

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {typeof Criteria}
   */
  static groupBy(...columns: string[]): typeof Criteria

  /**
   * Set a having statement in your query.
   *
   * @return {typeof Criteria}
   */
  static having(clause: (query: QueryBuilder) => void): typeof Criteria
  static having(columnName: string, value: any): typeof Criteria
  static having(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): typeof Criteria

  /**
   * Set a having exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static havingExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set a having not exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static havingNotExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static havingIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static havingNotIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static havingNull(columnName: string): typeof Criteria

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static havingNotNull(columnName: string): typeof Criteria

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static havingBetween(columnName: string, values: [any, any]): typeof Criteria

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static havingNotBetween(
    columnName: string,
    values: [any, any],
  ): typeof Criteria

  /**
   * Set an or having statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orHaving(clause: (query: QueryBuilder) => void): typeof Criteria
  static orHaving(columnName: string, value: any): typeof Criteria
  static orHaving(
    columnName: string,
    operation: '=' | '>' | '>=' | '<' | '<=' | '<>' | 'like' | 'ilike',
    value: any,
  ): typeof Criteria

  /**
   * Set an or having exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orHavingExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set an or having not exists statement in your query.
   *
   * @return {typeof Criteria}
   */
  static orHavingNotExists(builder: QueryBuilder): typeof Criteria

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orHavingIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {typeof Criteria}
   */
  static orHavingNotIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orHavingNull(columnName: string): typeof Criteria

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {typeof Criteria}
   */
  static orHavingNotNull(columnName: string): typeof Criteria

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orHavingBetween(
    columnName: string,
    values: [any, any],
  ): typeof Criteria

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {typeof Criteria}
   */
  static orHavingNotBetween(
    columnName: string,
    values: [any, any],
  ): typeof Criteria

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static latest(columnName?: string): typeof Criteria

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {typeof Criteria}
   */
  static oldest(columnName?: string): typeof Criteria

  /**
   * Set the offset number in your query.
   *
   * @param number {number}
   * @return {typeof Criteria}
   */
  static offset(number: number): typeof Criteria

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {typeof Criteria}
   */
  static limit(number: number): typeof Criteria

  /**
   * Get the criteria map.
   *
   * @return {Map<string, any[]>}
   */
  static get(): Map<string, any[]>
}

export class ModelQueryBuilder<T = any> extends QueryBuilder {
  /**
   * Creates a new instance of ModelQueryBuilder.
   *
   * @param model
   * @param withCriterias
   * @return {ModelQueryBuilder}
   */
  constructor(model: T, withCriterias?: boolean)

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<Model>}
   */
  findOrFail(): Promise<T>

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @param callback {() => Promise<any>}
   * @return {Promise<Model>}
   */
  findOr(callback: () => Promise<any>): Promise<T>

  /**
   * Find a value in database.
   *
   * @return {Promise<Model>}
   */
  find(): Promise<T>

  /**
   * Find many values in database.
   *
   * @return {Promise<Model[]>}
   */
  findMany(): Promise<T[]>

  /**
   * Find many values in database and return as a Collection.
   *
   * @return {Promise<Collection<Model>>>}
   */
  collection(): Promise<import('@athenna/common').Collection<T>>

  /**
   * Create one model in database.
   *
   * @param [data] {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<Model>}
   */
  // @ts-ignore
  create(data?: any, ignorePersistOnly?: boolean): Promise<T>

  /**
   * Create many models in database.
   *
   * @param [data] {any[]}
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<Model[]>}
   */
  // @ts-ignore
  createMany(data?: any[], ignorePersistOnly?: boolean): Promise<T[]>

  /**
   * Create data or update if already exists.
   *
   * @param {any} [data]
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<Model | Model[]>}
   */
  // @ts-ignore
  createOrUpdate(data?: any, ignorePersistOnly?: boolean): Promise<T | T[]>

  /**
   * Update one or more models in database.
   *
   * @param [data] {any}
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<Model | Model[]>}
   */
  update(data?: any, ignorePersistOnly?: boolean): Promise<T | T[]>

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<Model | Model[] | void>}
   */
  delete(force?: boolean): Promise<T | T[] | void>

  /**
   * Restore a soft deleted model from database.
   *
   * @return {Promise<Model | Model[]>}
   */
  restore(): Promise<T | T[]>

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name {string}
   * @return {ModelQueryBuilder}
   */
  removeCriteria(name: string): this

  /**
   * Get all the records even the soft deleted.
   *
   * @return {ModelQueryBuilder}
   */
  withTrashed(): this

  /**
   * Get only the soft deleted values from database.
   *
   * @return {ModelQueryBuilder}
   */
  onlyTrashed(): this

  /**
   * Eager load a relation in your query.
   *
   * @param relationName {string}
   * @param [callback] {any}
   * @return {typeof Criteria}
   */
  with(
    relationName: string,
    callback?: (
      query: ModelQueryBuilder<Model>,
    ) =>
      | void
      | Promise<void>
      | ModelQueryBuilder<Model>
      | Promise<ModelQueryBuilder<Model>>,
  ): this

  /**
   * Set a has statement in your query.
   *
   * @param relationName {string}
   * @param [operation] {string}
   * @param [count] {number}
   */
  has(
    relationName: string,
    operation?:
      | '='
      | '>'
      | '>='
      | '<'
      | '<='
      | '<>'
      | '=='
      | '!='
      | '==='
      | '!==',
    count?: number,
  ): this

  /**
   * Set a where has statement in your query.
   *
   * @param relationName {string}
   * @param [callback] {(query: ModelQueryBuilder) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>}
   * @param [operation] {string}
   * @param [count] {number}
   */
  whereHas(
    relationName: string,
    callback?: (
      query: ModelQueryBuilder,
    ) => void | Promise<void> | ModelQueryBuilder | Promise<ModelQueryBuilder>,
    operation?:
      | '='
      | '>'
      | '>='
      | '<'
      | '<='
      | '<>'
      | '=='
      | '!='
      | '==='
      | '!==',
    count?: number,
  ): this

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: this, criteriaValue: any) => void}
   */
  // @ts-ignore
  when(criteria: any, callback: (query: this, criteriaValue: any) => void): this
}

export class HasOneQueryBuilder<T> extends ModelQueryBuilder<T> {}
export class HasManyQueryBuilder<T> extends ModelQueryBuilder<T> {}
export class BelongsToQueryBuilder<T> extends ModelQueryBuilder<T> {
  /**
   * Assign a child model to a new parent model.
   *
   * @param childModel {import('#src/index').Model}
   * @return {void}
   */
  associate(childModel: Model): void

  /**
   * Remove a parent model from a child model.
   *
   * @return {void}
   */
  dissociate(): void
}

export class BelongsToManyQueryBuilder<T> extends ModelQueryBuilder<T> {
  /**
   * Get the pivot table data.
   *
   * @return {Promise<any[]>}
   */
  getPivotTable(): Promise<any[]>

  /**
   * Get the pivot table relation ids.
   *
   * @return {Promise<any[]>}
   */
  getPivotTablesRelationIds(): Promise<any[]>

  /**
   * Attach a model to another by inserting a record in the pivot
   * table.
   *
   * @return {Promise<void>}
   */
  attach(id: string, additionalColumns?: Record<string, any>): Promise<void>

  /**
   * Delete the appropriate record out of the pivot table; however,
   * both models will remain in the database.
   *
   * @return {Promise<void>}
   */
  detach(id?: any): Promise<void>
}
