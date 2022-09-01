/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import { EntitySchema } from 'typeorm'
import { Faker } from '@faker-js/faker'
import { PaginatedResponse } from '@secjs/utils'

export const Database: Facade & DatabaseImpl

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
   * @return {import('typeorm').DataSource|null}
   */
  getClient(): import('typeorm').DataSource

  /**
   * Creates a new instance of query builder.
   *
   * @param fullQuery {boolean}
   * @return {any}
   */
  query(fullQuery?: boolean): any

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
   * @param {any} options
   * @return {Promise<void>}
   */
  createTable(tableName: string, options: any): Promise<void>

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
   * @return {Promise<any>}
   */
  create(data: any): Promise<any>

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @return {Promise<any[]>}
   */
  createMany(data: any[]): Promise<any[]>

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
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {DatabaseImpl}
   */
  buildTable(tableName: string | any): DatabaseImpl

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {DatabaseImpl}
   */
  buildSelect(...columns: string[]): DatabaseImpl

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {DatabaseImpl}
   */
  buildAddSelect(...columns: string[]): DatabaseImpl

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {DatabaseImpl}
   */
  buildWhere(statement: string | Record<string, any>, value?: any): DatabaseImpl

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {DatabaseImpl}
   */
  buildIncludes(relation: string | any, operation?: string): DatabaseImpl

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {DatabaseImpl}
   */
  buildWhereLike(statement: string | Record<string, any>, value?: any): DatabaseImpl

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {DatabaseImpl}
   */
  buildWhereILike(statement: string | Record<string, any>, value?: any): DatabaseImpl

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {DatabaseImpl}
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): DatabaseImpl

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {DatabaseImpl}
   */
  buildWhereIn(columnName: string, values: any[]): DatabaseImpl

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {DatabaseImpl}
   */
  buildWhereNotIn(columnName: string, values: any[]): DatabaseImpl

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {DatabaseImpl}
   */
  buildWhereNull(columnName: string): DatabaseImpl

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {DatabaseImpl}
   */
  buildWhereNotNull(columnName: string): DatabaseImpl

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {DatabaseImpl}
   */
  buildWhereBetween(columnName: string, values: [any, any]): DatabaseImpl

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {DatabaseImpl}
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): DatabaseImpl

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {DatabaseImpl}
   */
  buildOrderBy(columnName: string, direction: 'asc'|'desc'|'ASC'|'DESC'): DatabaseImpl

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {DatabaseImpl}
   */
  buildSkip(number: number): DatabaseImpl

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {DatabaseImpl}
   */
  buildLimit(number: number): DatabaseImpl
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
   * Creates a new instance of query builder.
   *
   * @param fullQuery {boolean}
   * @return {any}
   */
  query(fullQuery?: boolean): any

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
   * @param {any} options
   * @return {Promise<void>}
   */
  createTable(tableName: string, options: any): Promise<void>

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
   * @return {Promise<number>}
   */
  increment(column: string): Promise<number>

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  decrement(column: string): Promise<number>

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
   * @return {Promise<any>}
   */
  create(data: any): Promise<any>

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @return {Promise<any[]>}
   */
  createMany(data: any[]): Promise<any[]>

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  update(data: any): Promise<any>

  /**
   * Delete one value in database.
   *
   * @return {Promise<any|void>}
   */
  delete(): Promise<any|void>

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {Transaction}
   */
  buildTable(tableName: string | any): Transaction

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Transaction}
   */
  buildSelect(...columns: string[]): Transaction

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Transaction}
   */
  buildAddSelect(...columns: string[]): Transaction

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhere(statement: string | Record<string, any>, value?: any): Transaction

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Transaction}
   */
  buildIncludes(relation: string | any, operation?: string): Transaction

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereLike(statement: string | Record<string, any>, value?: any): Transaction

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereILike(statement: string | Record<string, any>, value?: any): Transaction

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Transaction}
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): Transaction

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Transaction}
   */
  buildWhereIn(columnName: string, values: any[]): Transaction

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Transaction}
   */
  buildWhereNotIn(columnName: string, values: any[]): Transaction

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Transaction}
   */
  buildWhereNull(columnName: string): Transaction

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Transaction}
   */
  buildWhereNotNull(columnName: string): Transaction

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Transaction}
   */
  buildWhereBetween(columnName: string, values: [any, any]): Transaction

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Transaction}
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): Transaction

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {Transaction}
   */
  buildOrderBy(columnName: string, direction: 'asc'|'desc'|'ASC'|'DESC'): Transaction

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Transaction}
   */
  buildSkip(number: number): Transaction

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Transaction}
   */
  buildLimit(number: number): Transaction
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
   * @return {EntitySchema<any>}
   */
  static getSchema(): EntitySchema<any>

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
   * @param data {any}
   * @param {boolean} ignorePersistOnly
   * @return {Promise<any[]>}
   */
  createMany(data: any, ignorePersistOnly?: boolean): Promise<any[]>

  /**
   * Update one or more models in database.
   *
   * @param data {any}
   * @param {boolean} ignorePersistOnly
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
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {ModelQueryBuilder}
   */
  addSelect(...columns: string[]): ModelQueryBuilder

  /**
   * Set how many models should be skipped in your query.
   *
   * @param number {number}
   * @return {ModelQueryBuilder}
   */
  skip(number: number): ModelQueryBuilder

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
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  where(statement: string | Record<string, any>, value?: any): ModelQueryBuilder

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereLike(statement: string | Record<string, any>, value?: any): ModelQueryBuilder

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereILike(statement: string | Record<string, any>, value?: any): ModelQueryBuilder

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {ModelQueryBuilder}
   */
  whereNot(statement: string | Record<string, any>, value?: any): ModelQueryBuilder

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
   * @return {any}
   */
  static autoIncrementedInt(): any

  /**
   * Create a "createdAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default('now()').get()
   *
   * @return {any}
   */
  static createdAt(): any

  /**
   * Create a "updatedAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default('now()').get()
   *
   * @return {any}
   */
  static updatedAt(): any

  /**
   * Create a "deletedAt" column.
   *
   * This method is an alias for:
   * @example Column.type('timestamp').default(null).isNullable().get()
   *
   * @return {any}
   */
  static deletedAt(): any

  /**
   * Set the type of your column.
   *
   * @return {Column}
   */
  static type(type): typeof Column

  /**
   * Set the default value of your column.
   *
   * @return {Column}
   */
  static default(value): typeof Column

  /**
   * Set if this column should be hidded.
   */
  static isHidden(): typeof Column

  /**
   * Set if your column is auto generated.
   *
   * @return {Column}
   */
  static isGenerated(): typeof Column

  /**
   * Set if your column is primary.
   *
   * @return {Column}
   */
  static isPrimary(): typeof Column

  /**
   * Set if your column is unique.
   *
   * @return {Column}
   */
  static isUnique(): typeof Column

  /**
   * Set if your column is nullable.
   *
   * @return {Column}
   */
  static isNullable(): typeof Column

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

export class DatabaseCommandsLoader {
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
