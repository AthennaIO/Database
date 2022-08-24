/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class Database {
  /**
   * Creates a new instance of Database.
   *
   * @param {any} configs
   * @return {Database}
   */
  constructor(configs?: any)

  /**
   * Change the database connection.
   *
   * @param {string} connection
   * @return {Database}
   */
  connection(connection: string): Database

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnDriver
   * @return {Promise<void>}
   */
  connect(force?: boolean, saveOnDriver?: boolean): Promise<void>

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
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

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
   * @return {Promise<any>}
   */
  findMany(): Promise<any>

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
   * @return {Database}
   */
  buildTable(tableName: string | any): Database

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Database}
   */
  buildSelect(...columns: string[]): Database

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {Database}
   */
  buildAddSelect(...columns: string[]): Database

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhere(statement: string | Record<string, any>, value?: any): Database

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {Database}
   */
  buildIncludes(relation: string | any, operation?: string): Database

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereLike(statement: string | Record<string, any>, value?: any): Database

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereILike(statement: string | Record<string, any>, value?: any): Database

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {Database}
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): Database

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Database}
   */
  buildWhereIn(columnName: string, values: any[]): Database

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {Database}
   */
  buildWhereNotIn(columnName: string, values: any[]): Database

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {Database}
   */
  buildWhereNull(columnName: string): Database

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {Database}
   */
  buildWhereNotNull(columnName: string): Database

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Database}
   */
  buildWhereBetween(columnName: string, values: [any, any]): Database

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {Database}
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): Database

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {Database}
   */
  buildOrderBy(columnName: string, direction: 'asc'|'desc'|'ASC'|'DESC'): Database

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {Database}
   */
  buildSkip(number: number): Database

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {Database}
   */
  buildLimit(number: number): Database
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
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  getDatabases(): Promise<string[]>

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
   * @return {Promise<any>}
   */
  findMany(): Promise<any>

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
