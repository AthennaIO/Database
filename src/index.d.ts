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
import { Collection, PaginatedResponse } from '@secjs/utils'
import { DataSource } from 'typeorm'

export const Database: Facade & DatabaseImpl

export class QueryBuilder {
  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  avg(column: string): Promise<number>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  avgDistinct(column: string): Promise<number>

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  max(column: string): Promise<number>

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  min(column: string): Promise<number>

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  sum(column: string): Promise<number>

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  sumDistinct(column: string): Promise<number>

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  increment(column: string): Promise<number | number[]>

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number | number[]>}
   */
  decrement(column: string): Promise<number | number[]>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  count(column?: string): Promise<number>

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  countDistinct(column?: string): Promise<number>

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  findOrFail(): Promise<any>

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
  collection(): Promise<import('@secjs/utils').Collection>

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {}
   */
  paginate(page?: number, limit?: number, resourceUrl?: string): Promise<import('@secjs/utils').PaginatedResponse>

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  create(data: any, primaryKey?: string): Promise<any>

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any[]>}
   */
  createMany(data: any[], primaryKey?: string): Promise<any[]>

  /**
   * Create data or update if already exists.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any | any[]>}
   */
  createOrUpdate(data: any, primaryKey?: string): Promise<any | any[]>

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @param {boolean} force
   * @return {Promise<any | any[]>}
   */
  update(data: any, force?: boolean): Promise<any | any[]>

  /**
   * Delete one value in database.
   *
   * @return {Promise<any | void>}
   */
  delete(): Promise<any | void>

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  buildSelect(...columns: string[]): QueryBuilder

  /**
   * Set a join statement in your query.
   *
   * @param tableName {string}
   * @param column1 {string}
   * @param [operation] {string}
   * @param column2 {string}
   * @param joinType {string}
   * @return {QueryBuilder}
   */
  buildJoin(tableName: string, column1: string, operation: string, column2: string, joinType?: 'join' | 'innerJoin' | 'crossJoin' | 'leftJoin' | 'rightJoin' | 'outerJoin' | 'fullOuterJoin' | 'leftOuterJoin' | 'rightOuterJoin'): QueryBuilder
  buildJoin(tableName: string, column1: string, operation: string, column2: string): QueryBuilder
  buildJoin(tableName: string, column1: string, column2: string): QueryBuilder

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {QueryBuilder}
   */
  buildGroupBy(...columns: string[]): QueryBuilder

  /**
   * Set a where statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildWhere(statement: Record<string, any>): QueryBuilder
  buildWhere(statement: string, value: any): QueryBuilder
  buildWhere(statement: string, operation: string, value: any): QueryBuilder

  /**
   * Set a or where statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildOrWhere(statement: Record<string, any>): QueryBuilder
  buildOrWhere(statement: string, value: any): QueryBuilder
  buildOrWhere(statement: string, operation: string, value: any): QueryBuilder

  /**
   * Set a where not statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildWhereNot(statement: Record<string, any>): QueryBuilder
  buildWhereNot(statement: string, value: any): QueryBuilder

  /**
   * Set a where like statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildWhereLike(statement: Record<string, any>): QueryBuilder
  buildWhereLike(statement: string, value: any): QueryBuilder

  /**
   * Set a where ILike statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildWhereILike(statement: Record<string, any>): QueryBuilder
  buildWhereILike(statement: string, value: any): QueryBuilder

  /**
   * Set a where in statement in your query.
   *
   * @return {QueryBuilder}
   */
  buildWhereIn(columnName: string, values: any[]): QueryBuilder

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {QueryBuilder}
   */
  buildWhereNotIn(columnName: string, values: any[]): QueryBuilder

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  buildWhereNull(columnName: string): QueryBuilder

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {QueryBuilder}
   */
  buildWhereNotNull(columnName: string): QueryBuilder

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  buildWhereBetween(columnName: string, values: [any, any]): QueryBuilder

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {QueryBuilder}
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): QueryBuilder

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {QueryBuilder}
   */
  buildOrderBy(columnName: string, direction: 'asc' | 'desc' | 'ASC' | 'DESC'): QueryBuilder

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  buildOffset(number: number): QueryBuilder

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {QueryBuilder}
   */
  buildLimit(number: number): QueryBuilder
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
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>

  /**
   * Return the client of driver.
   *
   * @return {import('knex').Knex|null}
   */
  getClient(): import('knex').Knex

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
  createTable(tableName: string, callback: (builder: import('knex').Knex.TableBuilder) => void | Promise<void>): Promise<void>

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
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  raw(raw: string, queryValues: any[]): Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string|any}
   * @return {QueryBuilder}
   */
  buildTable(tableName: string | any): QueryBuilder
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
   * @param {import('typeorm').TableOptions} options
   * @return {Promise<void>}
   */
  createTable(tableName: string, options: import('typeorm').TableOptions): Promise<void>

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
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  raw(raw: string, queryValues: any[]): Promise<any>

  /**
   * Creates a new instance of QueryBuilder for this table.
   *
   * @param tableName {string|any}
   * @return {QueryBuilder}
   */
  buildTable(tableName: string | any): QueryBuilder
}

export class Criteria {
  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {Criteria}
   */
  static table(tableName: string | any): typeof Criteria

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Criteria}
   */
  static select(...columns: string[]): typeof Criteria

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Criteria}
   */
  static includes(relation: string | any, operation?: string): typeof Criteria

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static where(statement: string | Record<string, any>, value?: any): typeof Criteria

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static whereLike(statement: string | Record<string, any>, value?: any): typeof Criteria

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static whereILike(statement: string | Record<string, any>, value?: any): typeof Criteria

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Criteria}
   */
  static whereNot(statement: string | Record<string, any>, value?: any): typeof Criteria

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Criteria}
   */
  static whereIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Criteria}
   */
  static whereNotIn(columnName: string, values?: any[]): typeof Criteria

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Criteria}
   */
  static whereNull(columnName: string): typeof Criteria

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Criteria}
   */
  static whereNotNull(columnName: string): typeof Criteria

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Criteria}
   */
  static whereBetween(columnName: string, values: [any, any]): typeof Criteria

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Criteria}
   */
  static whereNotBetween(columnName: string, values: [any, any]): typeof Criteria

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {Criteria}
   */
  static orderBy(columnName: string, direction?: 'asc' | 'desc' | 'ASC' | 'DESC'): typeof Criteria

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Criteria}
   */
  static skip(number: number): typeof Criteria

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Criteria}
   */
  static limit(number: number): typeof Criteria

  /**
   * Get the criteria map.
   *
   * @return {Map<string, any[]>}
   */
  static get(): Map<string, any[]>
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
  buildConnection(connection: string): this

  /**
   * Set the schema name.
   *
   * @param name {string}
   * @return {SchemaBuilder}
   */
  buildName(name: string): this

  /**
   * Set the table name.
   *
   * @param tableName {string}
   * @return {SchemaBuilder}
   */
  buildTable(tableName: string): this

  /**
   * Convert the schema columns and relations to array and set.
   *
   * @param schema {any}
   */
  buildSchema(schema: any): this

  /**
   * Convert to array and set the columns.
   *
   * @param columns {any}
   * @return {SchemaBuilder}
   */
  buildColumns(columns: any): this

  /**
   * Convert to array and set the columns.
   *
   * @param relations {any}
   * @return {SchemaBuilder}
   */
  buildRelations(relations: any): this

  /**
   * Set if schema should be synchronized with database.
   *
   * @return {SchemaBuilder}
   */
  isToSynchronize(): this

  /**
   * Get all the relations that has the "isIncluded"
   * property as true.
   *
   * @return {any[]}
   */
  getIncludedRelations(): any[]

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

export class ModelFactory {
  /**
   * Creates a new instance of ModelFactory.
   *
   * @param Model {any}
   * @param returning {string}
   * @return {ModelFactory}
   */
  constructor(Model: any, returning?: string)

  /**
   * Set the number of models to be created
   *
   * @param number
   * @return {ModelFactory}
   */
  count(number: number): ModelFactory

  /**
   * Make models without creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   */
  make(override?: any, asArrayOnOne?: boolean): Promise<any | any[]>

  /**
   * Create models creating it on database.
   *
   * @param override {any}
   * @param asArrayOnOne {boolean}
   * @return {any | any[]}
   */
  create(override?: any, asArrayOnOne?: boolean): Promise<any | any[]>
}

export class ModelGenerator {
   /**
    * Creates a new instance of ModelGenerator.
    *
    * @param Model {import('#src/index').Model}
    * @param schema {import('#src/index').SchemaBuilder}
    * @return {ModelGenerator}
    */
   constructor(Model: Model, schema: SchemaBuilder)
 
   /**
    * Generate one model instance with relations loaded.
    *
    * @param data {any}
    * @return {Promise<any>}
    */
  generateOne(data: any): Promise<any>
 
   /**
    * Generate models instances with relations loaded.
    *
    * @param data {any[]}
    * @return {Promise<any[]>}
    */
  generateMany(data: any[]): Promise<any[]>
}

export class Model {
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
   * Return the criterias set to this model.
   *
   * @return {any}
   */
  static get criterias(): any
  /**
   * The faker instance to create fake data.
   *
   * @type {Faker}
   */
  static faker: Faker

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
   * Create the factory object to generate data.
   *
   * @return {ModelFactory}
   */
  static factory(returning?: string): ModelFactory

  /**
   * The TypeORM entity schema instance.
   *
   * @return {SchemaBuilder}
   */
  static getSchema(): SchemaBuilder

  /**
   * The TypeORM client instance.
   *
   * @return {DataSource}
   */
  static getClient(): DataSource

  /**
   * Create a new model query builder.
   *
   * @param [withCriterias] {boolean}
   * @return {ModelQueryBuilder}
   */
  static query(withCriterias?: boolean): ModelQueryBuilder

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
  static findOrFail<Class extends typeof Model>(this: Class, where?: any): Promise<InstanceType<Class>>

  /**
   * Get one data in DB and return as a subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>>}
   */
  static find<Class extends typeof Model>(this: Class, where?: any): Promise<InstanceType<Class>>

  /**
   * Get many data in DB and return as an array of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<InstanceType<this>[]>}
   */
  static findMany<Class extends typeof Model>(this: Class, where?: any): Promise<InstanceType<Class>>

  /**
   * Get many data in DB and return as a collection of subclass instance.
   *
   * @param {any} [where]
   * @return {Promise<Collection<InstanceType<Class>>>}
   */
  static collection<Class extends typeof Model>(this: Class, where?: any): Promise<Collection<InstanceType<Class>>>

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
  static paginate<Class extends typeof Model>(this: Class, page?: number, limit?: number, resourceUrl?: string): Promise<PaginatedResponse>

  /**
   * Create a new model in DB and return as a subclass instance.
   *
   * @param {any} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>>}
   */
  static create<Class extends typeof Model>(this: Class, data?: any, ignorePersistOnly?: boolean): Promise<InstanceType<Class>>

  /**
   * Create many models in DB and return as subclass instances.
   *
   * @param {any[]} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>[]>}
   */
  static createMany<Class extends typeof Model>(this: Class, data?: any[], ignorePersistOnly?: boolean): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Create or update models in DB and return as subclass instances.
   *
   * @param {any} where
   * @param {any} data
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this> | InstanceType<this>[]>}
   */
  static createOrUpdate<Class extends typeof Model>(this: Class, where?: any, data?: any, ignorePersistOnly?: boolean): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Update a model in DB and return as a subclass instance.
   *
   * @param {any} where
   * @param {any} [data]
   * @param {boolean} ignorePersistOnly
   * @return {Promise<InstanceType<this>|InstanceType<this>[]>}
   */
  static update<Class extends typeof Model>(this: Class, where: any, data?: any, ignorePersistOnly?: boolean): Promise<InstanceType<Class> | InstanceType<Class>[]>

  /**
   * Delete a model in DB and return as a subclass instance or void.
   *
   * @param {any} where
   * @param {boolean} force
   * @return {Promise<InstanceType<this>|void>}
   */
  static delete<Class extends typeof Model>(this: Class, where: any, force?: boolean): Promise<InstanceType<Class> | void>

  /**
   * Assert that the model has been softly deleted.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static assertSoftDelete(where: any): Promise<void>

  /**
   * Assert that the number of respective model is the number.
   *
   * @param {number} number
   * @return {Promise<void>}
   */
  static assertCount(number: number): Promise<void>

  /**
   * Assert that the values matches any model in database.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static assertExists(where: any): Promise<void>

  /**
   * Assert that the values does not match any model in database.
   *
   * @param {any} where
   * @return {Promise<void>}
   */
  static assertNotExists(where: any): Promise<void>

  /**
   * Return a Json object from the actual subclass instance.
   *
   * @return {any|any[]}
   */
  toJSON(): any | any[]
}

export class ModelQueryBuilder {
  /**
   * Creates a new instance of ModelQueryBuilder.
   *
   * @param model
   * @param withCriterias
   * @return {ModelQueryBuilder}
   */
  constructor(model: any, withCriterias?: boolean)

  /**
   * Find one data in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  findOrFail(): Promise<any>

  /**
   * Find one data in database.
   *
   * @return {Promise<any>}
   */
  find(): Promise<any>

  /**
   * Find many data in database.
   *
   * @return {Promise<any[]>}
   */
  findMany(): Promise<any[]>

  /**
   * Find many data in database and return as a Collection.
   *
   * @return {Promise<import('@secjs/utils').Collection>}
   */
  collection(): Promise<Collection>

  /**
   * Find many models in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<{
   *   data: Model[],
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
  paginate(page?: number, limit?: number, resourceUrl?: string): Promise<PaginatedResponse>

  /**
   * Count the number of models in database.
   *
   * @return {Promise<number>}
   */
  count(): Promise<number>

  /**
   * Create one model in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any>}
   */
  create(data: any, ignorePersistOnly?: boolean): Promise<any>

  /**
   * Create many models in database.
   *
   * @param data {any[]}
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<any[]>}
   */
  createMany(data: any[], ignorePersistOnly?: boolean): Promise<any[]>

  /**
   * Create data or update if already exists.
   *
   * @param {any} data
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<any | any[]>}
   */
  createOrUpdate(data: any, ignorePersistOnly?: boolean): Promise<any | any[]>

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} [ignorePersistOnly]
   * @return {Promise<any|any[]>}
   */
  update(data: any, ignorePersistOnly?: boolean): Promise<any | any[]>

  /**
   * Delete one or more models in database.
   *
   * @param [force] {boolean}
   * @return {Promise<any|any[]|void>}
   */
  delete(force?: boolean): Promise<any | any[] | void>

  /**
   * Remove the criteria from query builder by name.
   *
   * @param name
   * @return {ModelQueryBuilder}
   */
  removeCriteria(name: string): ModelQueryBuilder

  /**
   * List the criterias from query builder.
   *
   * @param withRemoved {boolean}
   * @return {any}
   */
  listCriterias(withRemoved?: boolean): any

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  select(...columns: string[]): ModelQueryBuilder

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  offset(number: number): ModelQueryBuilder

  /**
   * Set the limit of models in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  limit(number: number): ModelQueryBuilder

  /**
   * Set the order in your query.
   *
   * @param [columnName] {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {ModelQueryBuilder}
   */
  orderBy(columnName?: boolean, direction?: 'asc' | 'desc' | 'ASC' | 'DESC'): ModelQueryBuilder

  /**
   * Include some relation in your query.
   *
   * @param [relationName] {string|any}
   * @return {ModelQueryBuilder}
   */
  includes(relationName: string): ModelQueryBuilder

  /**
   * Set a where statement in your query.
   *
   * @return {ModelQueryBuilder}
   */
  where(statement: Record<string, any>): ModelQueryBuilder
  where(statement: string, value: any): ModelQueryBuilder
  where(statement: string, operation: string, value: any): ModelQueryBuilder

  /**
   * Set a where not statement in your query.
   *
   * @return {ModelQueryBuilder}
   */
  whereNot(statement: Record<string, any>): ModelQueryBuilder
  whereNot(statement: string, value: any): ModelQueryBuilder

  /**
   * Set a where like statement in your query.
   *
   * @return {ModelQueryBuilder}
   */
  whereLike(statement: Record<string, any>): ModelQueryBuilder
  whereLike(statement: string, value: any): ModelQueryBuilder

  /**
   * Set a where ILike statement in your query.
   *
   * @return {ModelQueryBuilder}
   */
  whereILike(statement: Record<string, any>): ModelQueryBuilder
  whereILike(statement: string, value: any): ModelQueryBuilder

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  whereIn(columnName: string, values: any[]): ModelQueryBuilder

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {ModelQueryBuilder}
   */
  whereNotIn(columnName: string, values: any[]): ModelQueryBuilder

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  whereBetween(columnName: string, values: [any, any]): ModelQueryBuilder

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {ModelQueryBuilder}
   */
  whereNotBetween(columnName: string, values: [any, any]): ModelQueryBuilder

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNull(columnName: string): ModelQueryBuilder

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {ModelQueryBuilder}
   */
  whereNotNull(columnName: string): ModelQueryBuilder
}

export class Column {
  /**
   * Create an auto incremented integer primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('int').isGenerated().isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedInt(name: string): any

  /**
   * Create an auto incremented uuid primary key. Usefully for id's.
   *
   * This method is an alias for:
   * @example Column.type('uuid').isGenerated().isPrimary().get()
   *
   * @param [name] {string}
   * @return {any}
   */
  static autoIncrementedUuid(name: string): any

  /**
   * Create a "string" column.
   *
   * This method is an alias for:
   * @example Column.type('varchar').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {string|number} [length]
   */
  static string(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    length?: string|number,
    default?: any,
    enu?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }, length?: number): any

  /**
   * Create an "enum" column.
   *
   * This method is an alias for:
   * @example Column.type('enum').enu(values).get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  length?: string|number,
   *  default?: any,
   *  enu?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {any} [values]
   */
  static enum(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    length?: string|number,
    default?: any,
    enu?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }, values?: any): any

  /**
   * Create an "integer" column.
   *
   * This method is an alias for:
   * @example Column.type('int').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   */
  static integer(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    scale?: number,
    precision?: number,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "float" column.
   *
   * This method is an alias for:
   * @example Column.type('float').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static float(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    scale?: number,
    precision?: number,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "double" column.
   *
   * This method is an alias for:
   * @example Column.type('double').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static double(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    scale?: number,
    precision?: number,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "numeric" column.
   *
   * This method is an alias for:
   * @example Column.type('numeric').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   * @param {number} [scale]
   * @param {number} [precision]
   * @return {any}
   */
  static numeric(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    scale?: number,
    precision?: number,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }, scale?: number, precision?: number): any

  /**
   * Create a "decimal" column.
   *
   * This method is an alias for:
   * @example Column.type('decimal').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  scale?: number,
   *  precision?: number,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @param {number} [scale]
   *  @param {number} [precision]
   *  @return {any}
   */
  static decimal(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    scale?: number,
    precision?: number,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }, scale?: number, precision?: number): any

  /**
   * Create a "json" column.
   *
   * This method is an alias for:
   * @example Column.type('json').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static json(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "jsonb" column.
   *
   * This method is an alias for:
   * @example Column.type('jsonb').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static jsonb(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "date" column.
   *
   * This method is an alias for:
   * @example Column.type('date').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static date(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "datetime" column.
   *
   * This method is an alias for:
   * @example Column.type('datetime').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static datetime(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "timestamp" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').get()
   *
   * @param {string|{
   *  type?: import('typeorm').ColumnType,
   *  name?: string,
   *  default?: any,
   *  isHidden?: boolean,
   *  isGenerated?: boolean,
   *  isPrimary?: boolean,
   *  isUnique?: boolean,
   *  isNullable?: boolean,
   *  }} [optionsOrName]
   *  @return {any}
   */
  static timestamp(optionsOrName?: string | {
    type?: import('typeorm').ColumnType,
    name?: string,
    default?: any,
    isHidden?: boolean,
    isGenerated?: boolean,
    isPrimary?: boolean,
    isUnique?: boolean,
    isNullable?: boolean,
  }): any

  /**
   * Create a "createdAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static createdAt(name: string): any

  /**
   * Create a "updatedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static updatedAt(name: string): any

  /**
   * Create a "deletedAt" column.
   *
   * @param [name] {string}
   * @return {any}
   */
  static deletedAt(name: string): any

  /**
   * Set the type of your column.
   *
   * @param {import('typeorm').ColumnType} type
   * @return {this}
   */
  static type(type: import('typeorm').ColumnType): typeof Column

  /**
   * Set the real name of your column.
   *
   * @param {string} name
   * @return {this}
   */
  static name(name: string): typeof Column

  /**
   * Set the default value of your column.
   *
   * @param {any} value
   * @return {this}
   */
  static default(value: any): typeof Column

  /**
   * Set the length of your column.
   *
   * @param {string|number} length
   * @return {this}
   */
  static length(length: string | number): typeof Column

  /**
   * Set the enum of your column.
   *
   * @param {any} enu
   * @return {this}
   */
  static enu(enu: any): typeof Column

  /**
   * Set the scale of your column.
   *
   * @param {number} scale
   * @return {this}
   */
  static scale(scale: number): typeof Column

  /**
   * Set the precision of your column.
   *
   * @param {number} precision
   * @return {this}
   */
  static precision(precision: number): typeof Column

  /**
   * Set if this column should be created date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isCreateDate(is?: boolean): typeof Column

  /**
   * Set if this column should be updated date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isUpdateDate(is?: boolean): typeof Column

  /**
   * Set if this column should be deleted date.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isDeleteDate(is?: boolean): typeof Column

  /**
   * Set if this column should be hided.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isHidden(is?: boolean): typeof Column

  /**
   * Set if your column is auto generated.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isGenerated(is?: boolean): typeof Column

  /**
   * Set if your column is primary.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isPrimary(is?: boolean): typeof Column

  /**
   * Set if your column is unique.
   *
   * @param {boolean} [is]
   * @return {this}
   */
  static isUnique(is?: boolean): typeof Column

  /**
   * Set if your column is nullable.
   *
   * @param {boolean} [is]
   * @return {this}
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
   * Create a oneToOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('one-to-one').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static oneToOne(inverseSide: string, model: any, cascade?: boolean): any

  /**
   * Create a oneToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('one-to-many').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static oneToMany(inverseSide: string, model: any, cascade?: boolean): any

  /**
   * Create a manyToOne relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('many-to-one').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToOne(inverseSide: string, model: any, cascade?: boolean): any

  /**
   * Create a manyToMany relation schema.
   *
   * This method is an alias for:
   * @example Relation.target(model).type('many-tomany').inverseSide(inverseSide).get()
   *
   * @param inverseSide {string}
   * @param model {any}
   * @param cascade {boolean}
   * @return {any}
   */
  static manyToMany(inverseSide: string, model: any, cascade?: boolean): any

  /**
   * Set the target model that your relation is pointing.
   *
   * @param model {any}
   * @return {Relation}
   */
  static target(model: any): typeof Relation

  /**
   * Set the relation type.
   *
   * @param type {"one-to-one","one-to-many","many-to-one","many-to-many"}
   * @return {Relation}
   */
  static type(type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many"): typeof Relation

  /**
   * Set the inverse side of your model schema.
   *
   * @param name
   * @return {Relation}
   */
  static inverseSide(name: string): typeof Relation

  /**
   * Set the column that the relation should join.
   *
   * @param column
   * @return {Relation}
   */
  static joinColumn(column: any): typeof Relation

  /**
   * Set if relation should be cascaded on delete/update.
   *
   * @return {Relation}
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
  static fabricate(connectionName: string): { Driver: any, clientConnection?: any }

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
  static createConnectionByDriver(driverName: string, conName?: string, saveOnDriver?: boolean): Promise<any>

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
  static createConnectionByName(conName?: string, saveOnDriver?: boolean): Promise<any>

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
   * Create a table instance.
   *
   * @return {string}
   */
  static get tableName(): string

  /**
   * Create a table instance.
   *
   * @return {string}
   */
  static get connection(): string

  /**
   * Return a new database instance using the migration connection.
   *
   * @return {DatabaseImpl}
   */
  static get DB(): DatabaseImpl

  /**
   * Run the migrations.
   *
   * @return {Promise<void>}
   */
  up(): Promise<void>

  /**
   * Reverse the migrations.
   *
   * @return {Promise<void>}
   */
  down(): Promise<void>
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

  /**
   * Get the schema of all models with same connection.
   *
   * @param connection {string}
   * @param [path] {string}
   * @param [defaultConnection] {string}
   * @return {Promise<any[]>}
   */
  static loadEntities(connection: string, path?: string, defaultConnection?: string): Promise<any[]>
}
