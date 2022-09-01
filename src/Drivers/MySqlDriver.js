/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MigrationExecutor, Table } from 'typeorm'
import { Exec, Is, Json } from '@secjs/utils'

import { Transaction } from '#src/index'
import { DriverFactory } from '#src/Factories/DriverFactory'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NoTableSelectedException } from '#src/Exceptions/NoTableSelectedException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'

export class MySqlDriver {
  /**
   * Set if this instance is connected with database.
   *
   * @type {boolean}
   */
  #isConnected = false

  /**
   * Set if the connection will be saved on factory.
   *
   * @type {boolean}
   */
  #isSavedOnFactory = true

  /**
   * The TypeORM data source.
   *
   * @type {import('typeorm').DataSource|null}
   */
  #dataSource = null

  /**
   * The query runner responsible to handle database operations.
   *
   * @type {import('typeorm').QueryRunner|null}
   */
  #runner = null

  /**
   * The connection name used for this instance.
   *
   * @type {string|null}
   */
  #connection = null

  /**
   * Set the table that this instance will work with.
   *
   * @type {string|null}
   */
  #table = null

  /**
   * The where queries done to this instance.
   *
   * @type {Map<string, any>}
   */
  #where = new Map()

  /**
   * The orderBy queries done to this instance.
   *
   * @type {Map<string, any>}
   */
  #orderBy = new Map()

  /**
   * The select queries done to this instance.
   *
   * @type {string[]}
   */
  #select = []

  /**
   * The add select queries done to this instance.
   *
   * @type {string[]}
   */
  #addSelect = []

  /**
   * The skip value done to this instance.
   *
   * @type {number|null}
   */
  #skip = null

  /**
   * The limit value done to this instance.
   *
   * @type {number|null}
   */
  #limit = null

  /**
   * The relations queries done to this instance.
   *
   * @type {Map<string, any>}
   */
  #relations = new Map()

  /**
   * Creates a new instance of MySqlDriver.
   *
   * @param {string|any} connection
   * @param {any} [client]
   * @return {Database}
   */
  constructor(connection, client = null) {
    this.#connection = connection

    if (client) {
      this.#isConnected = true
      this.#isSavedOnFactory = true

      this.#runner = client.runner
      this.#dataSource = client.dataSource
    }
  }

  /**
   * Return the client of driver.
   *
   * @return {import('typeorm').DataSource|null}
   */
  getClient() {
    return this.#dataSource
  }

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnFactory
   * @return {Promise<void>}
   */
  async connect(force = false, saveOnFactory = true) {
    if (this.#isConnected && !force) {
      return
    }

    const { runner, dataSource } = await DriverFactory.createConnectionByDriver(
      'mysql',
      this.#connection,
      saveOnFactory,
    )

    this.#runner = runner
    this.#dataSource = dataSource

    this.#isConnected = true
    this.#isSavedOnFactory = saveOnFactory
  }

  /**
   * Close the connection with database in this instance.
   *
   * @return {Promise<void>}
   */
  async close() {
    if (!this.#isConnected) {
      return
    }

    if (this.#isSavedOnFactory) {
      await DriverFactory.closeConnectionByDriver('mysql')
    } else {
      await this.#runner.release()
      await this.#dataSource.destroy()
    }

    this.#table = null
    this.#runner = null
    this.#dataSource = null
    this.#isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   *
   * @param fullQuery {boolean}
   * @return {import('typeorm').SelectQueryBuilder}
   */
  query(fullQuery = false) {
    if (!this.#isConnected) {
      throw new NotConnectedDatabaseException()
    }

    if (!fullQuery) {
      return this.#runner.manager.createQueryBuilder()
    }

    if (!this.#table) {
      throw new NoTableSelectedException()
    }

    /** @type {import('typeorm').SelectQueryBuilder} */
    const query = this.#runner.manager
      .getRepository(this.#table)
      .createQueryBuilder(this.#table)

    this.#setRelationsOnQuery(query)
    this.#setSelectOnQuery(query)
    this.#setAddSelectOnQuery(query)
    this.#setWhereOnQuery(query)
    this.#setOrderByOnQuery(query)

    if (this.#skip) {
      query.skip(this.#skip)
    }

    if (this.#limit) {
      query.limit(this.#limit)
    }

    return query
  }

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  async startTransaction() {
    this.#runner = this.#dataSource.createQueryRunner()

    await this.#runner.startTransaction()

    return new Transaction(this)
  }

  /**
   * Commit the transaction.
   *
   * @return {Promise<void>}
   */
  async commitTransaction() {
    await this.#runner.commitTransaction()
    await this.#runner.release()

    this.#table = null
    this.#runner = null
    this.#dataSource = null
    this.#isConnected = false
  }

  /**
   * Rollback the transaction.
   *
   * @return {Promise<void>}
   */
  async rollbackTransaction() {
    await this.#runner.rollbackTransaction()
    await this.#runner.release()

    this.#table = null
    this.#runner = null
    this.#dataSource = null
    this.#isConnected = false
  }

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  async runMigrations() {
    await this.#dataSource.runMigrations()
  }

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  async revertMigrations() {
    const executor = new MigrationExecutor(this.#dataSource)

    const migrations = await executor.getAllMigrations()

    for (let i = 0; i < migrations.length; i++) {
      await executor.undoLastMigration()
    }
  }

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  async getDatabases() {
    return this.#runner.getDatabases()
  }

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  async getCurrentDatabase() {
    return this.#runner.getCurrentDatabase()
  }

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {Promise<boolean>}
   */
  async hasDatabase(database) {
    return this.#runner.hasDatabase(database)
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    await this.#runner.createDatabase(databaseName, true)
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    await this.#runner.dropDatabase(databaseName, true)
  }

  /**
   * Get metadata information's about some database table.
   *
   * @param {string} table
   * @return {Promise<any>}
   */
  async getTable(table) {
    return this.#runner.getTable(table)
  }

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  async getTables() {
    const tablesInstance = await this.#runner.getTables()

    return tablesInstance.map(tableInstance => tableInstance.name)
  }

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {Promise<boolean>}
   */
  async hasTable(table) {
    return this.#runner.hasTable(table)
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {import('typeorm').TableOptions} options
   * @return {Promise<void>}
   */
  async createTable(tableName, options = {}) {
    await this.#runner.createTable(
      new Table({ name: tableName, ...options }),
      true,
    )
  }

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async dropTable(tableName) {
    await this.#runner.dropTable(tableName, true)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    await this.raw(`TRUNCATE TABLE ${tableName}`)
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  async raw(raw, queryValues) {
    return this.#runner?.query(raw, queryValues)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    const { avg } = await this.query(true)
      .select(`AVG(${column})`, 'avg')
      .getRawOne()

    return parseInt(avg)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    const { avg } = await this.query(true)
      .select(`AVG(${column})`, 'avg')
      .distinct(true)
      .getRawOne()

    return parseInt(avg)
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    const { max } = await this.query(true)
      .select(`MAX(${column})`, 'max')
      .getRawOne()

    return parseInt(max)
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    const { min } = await this.query(true)
      .select(`MIN(${column})`, 'min')
      .getRawOne()

    return parseInt(min)
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    const { sum } = await this.query(true)
      .select(`SUM(${column})`, 'sum')
      .getRawOne()

    return parseInt(sum)
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    const { sum } = await this.query(true)
      .select(`SUM(${column})`, 'sum')
      .distinct(true)
      .getRawOne()

    return parseInt(sum)
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async increment(column) {
    const result = await this.update({ [column]: () => `${column} + 1` }, true)

    if (Is.Array(result)) {
      return result.map(r => r[column])
    }

    return result[column]
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async decrement(column) {
    const result = await this.update({ [column]: () => `${column} - 1` }, true)

    if (Is.Array(result)) {
      return result.map(r => r[column])
    }

    return result[column]
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async count(column = '*') {
    if (column === '*') {
      // eslint-disable-next-line no-unused-vars
      const [_, count] = await this.query(true).getManyAndCount()

      return count
    }

    const { count } = await this.query(true)
      .select(`COUNT(${column})`, 'count')
      .getRawOne()

    return parseInt(count)
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async countDistinct(column = '*') {
    if (column === '*') {
      // eslint-disable-next-line no-unused-vars
      const [_, count] = await this.query(true)
        .select()
        .distinct(true)
        .getManyAndCount()

      return count
    }

    const { count } = await this.query(true)
      .select(`COUNT(${column})`, 'count')
      .distinct(true)
      .getRawOne()

    return parseInt(count)
  }

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    const where = Json.copy(this.#where)

    const data = await this.find()

    if (!data) {
      throw new NotFoundDataException(where, this.#connection)
    }

    return data
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    return this.query(true).getOne()
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    return this.query(true).getMany()
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@secjs/utils').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    const [data, count] = await this.query(true)
      .take(page)
      .limit(limit)
      .getManyAndCount()

    return Exec.pagination(data, count, { page, limit, resourceUrl })
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async create(data) {
    if (Is.Array(data)) {
      throw new WrongMethodException('create', 'createMany')
    }

    const select = [...this.#select]
    const addSelect = [...this.#addSelect]

    const { identifiers } = await this.query(true)
      .insert()
      .values(data)
      .execute()

    const query = this.query(true)

    if (select.length) {
      query.select(select)
    }

    if (addSelect.length) {
      query.addSelect(addSelect)
    }

    return query.where('id = :id', { id: identifiers[0].id }).getOne()
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @return {Promise<any>}
   */
  async createMany(data) {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    const select = [...this.#select]
    const addSelect = [...this.#addSelect]

    const { identifiers } = await this.query(true)
      .insert()
      .values(data)
      .execute()

    const promises = []

    identifiers.forEach(({ id }) => {
      const query = this.query(true)

      if (select.length) {
        query.select(select)
      }

      if (addSelect.length) {
        query.addSelect(addSelect)
      }

      promises.push(query.where('id = :id', { id }).getOne())
    })

    return Promise.all(promises)
  }

  /**
   * Create data or update if already exists.
   *
   * @param {any | any[]} data
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data) {
    const select = Json.copy(this.#select)
    const orderBy = Json.copy(this.#orderBy)
    const relations = Json.copy(this.#relations)
    const addSelect = Json.copy(this.#addSelect)

    const hasValue = await this.find()

    if (hasValue) {
      const firstKey = Object.keys(hasValue)[0]

      this.buildWhere(firstKey, hasValue[firstKey])

      this.#select = select
      this.#orderBy = orderBy
      this.#relations = relations
      this.#addSelect = addSelect

      return this.update(data)
    }

    return this.create(data)
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @param {boolean} [force]
   * @return {Promise<any>}
   */
  async update(data, force = false) {
    if (!this.#where.size && !force) {
      throw new EmptyWhereException('update')
    }

    const where = Json.copy(this.#where)
    const select = Json.copy(this.#select)
    const orderBy = Json.copy(this.#orderBy)
    const relations = Json.copy(this.#relations)
    const addSelect = Json.copy(this.#addSelect)

    await this.query(true).update(this.#table).set(data).execute()

    this.#where = where
    this.#select = select
    this.#orderBy = orderBy
    this.#relations = relations
    this.#addSelect = addSelect

    const result = await this.findMany()

    if (result.length === 1) {
      return result[0]
    }

    return result
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<void>}
   */
  async delete() {
    if (!this.#where.size) {
      throw new EmptyWhereException('delete')
    }

    await this.query(true).delete().execute()
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {MySqlDriver}
   */
  buildTable(tableName) {
    this.#table = tableName

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {MySqlDriver}
   */
  buildSelect(...columns) {
    if (columns.find(column => column === '*')) {
      this.#select = []

      return this
    }

    columns.forEach(c => this.#select.push(this.#getColumnParam(c)))

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {MySqlDriver}
   */
  buildAddSelect(...columns) {
    columns.forEach(c => this.#addSelect.push(this.#getColumnParam(c)))

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {MySqlDriver}
   */
  buildWhere(statement, value) {
    return this.#buildWhere('=', statement, value)
  }

  /**
   * Set a include statement in your query.
   *
   * @param relation {string|any}
   * @param [operation] {string}
   * @return {MySqlDriver}
   */
  buildIncludes(relation, operation = 'leftJoinAndSelect') {
    this.#relations.set(this.#getColumnParam(relation), {
      name: relation,
      operation,
    })

    return this
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {MySqlDriver}
   */
  buildWhereLike(statement, value) {
    if (!value.includes('%')) {
      value = `%${value}%`
    }

    return this.#buildWhere('LIKE', statement, value)
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {MySqlDriver}
   */
  buildWhereILike(statement, value) {
    if (!value.includes('%')) {
      value = `%${value}%`
    }

    return this.#buildWhere('LIKE', statement, value)
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {MySqlDriver}
   */
  buildWhereNot(statement, value) {
    return this.#buildWhere('!=', statement, value)
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MySqlDriver}
   */
  buildWhereIn(columnName, values) {
    return this.#buildWhere('IN', columnName, values)
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MySqlDriver}
   */
  buildWhereNotIn(columnName, values) {
    return this.#buildWhere('NOT IN', columnName, values)
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {MySqlDriver}
   */
  buildWhereNull(columnName) {
    return this.#buildWhere('IS NULL', columnName)
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {MySqlDriver}
   */
  buildWhereNotNull(columnName) {
    return this.#buildWhere('IS NOT NULL', columnName)
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MySqlDriver}
   */
  buildWhereBetween(columnName, values) {
    return this.#buildWhere('BETWEEN', columnName, values)
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MySqlDriver}
   */
  buildWhereNotBetween(columnName, values) {
    return this.#buildWhere('NOT BETWEEN', columnName, values)
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {MySqlDriver}
   */
  buildOrderBy(columnName, direction = 'ASC') {
    this.#orderBy.set(this.#getColumnParam(columnName), direction.toUpperCase())

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {MySqlDriver}
   */
  buildSkip(number) {
    this.#skip = number

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {MySqlDriver}
   */
  buildLimit(number) {
    this.#limit = number

    return this
  }

  /**
   * Get the parsed string to use in where keys.
   *
   * @param fieldName {string}
   * @param operation {string}
   * @return {string}
   */
  #getParsedWhereKey(fieldName, operation) {
    if (operation === 'BETWEEN' || operation === 'NOT BETWEEN') {
      return `${this.#getColumnParam(
        fieldName,
      )} ${operation} :${fieldName}Gte and :${fieldName}Lte`
    }

    if (operation === 'IS NULL' || operation === 'IS NOT NULL') {
      return `${this.#getColumnParam(fieldName)} ${operation}`
    }

    if (operation === 'IN' || operation === 'NOT IN') {
      return `${this.#getColumnParam(
        fieldName,
      )} ${operation} (:...${fieldName})`
    }

    return `${this.#getColumnParam(fieldName)} ${operation} :${fieldName}`
  }

  /**
   * Build where used by all other methods.
   *
   * @param operation {string}
   * @param statement {string}
   * @param [value] {any}
   * @return {MySqlDriver}
   */
  #buildWhere(operation, statement, value) {
    if (typeof statement === 'string') {
      const key = statement

      statement = { [key]: value }
    }

    Object.keys(statement).forEach(key => {
      let value = { [key]: statement[key] }

      if (operation === 'IS NULL' || operation === 'IS NOT NULL') {
        value = null
      }

      if (operation === 'BETWEEN' || operation === 'NOT BETWEEN') {
        value = {
          [`${key}Gte`]: statement[key][0],
          [`${key}Lte`]: statement[key][1],
        }
      }

      this.#where.set(this.#getParsedWhereKey(key, operation), value)
    })

    return this
  }

  /**
   * Set select options in query if exists.
   *
   * @param query {import('typeorm').SelectQueryBuilder}
   */
  #setSelectOnQuery(query) {
    if (query.returning) {
      query.returning(this.#select.length ? this.#select : '*')

      return
    }

    if (!this.#select.length) {
      return
    }

    query.select(this.#select)

    this.#select = []
  }

  /**
   * Set add select options in query if exists.
   *
   * @param query {import('typeorm').SelectQueryBuilder}
   */
  #setAddSelectOnQuery(query) {
    if (query.returning) {
      query.returning(this.#addSelect.length ? this.#addSelect : '*')

      return
    }

    if (!this.#addSelect.length) {
      return
    }

    this.#addSelect.forEach(select => query.addSelect(select))

    this.#addSelect = []
  }

  /**
   * Set all where options in query if exists.
   *
   * @param query {import('typeorm').SelectQueryBuilder}
   */
  #setWhereOnQuery(query) {
    if (!this.#where.size) {
      return
    }

    const iterator = this.#where.entries()

    for (const [key, value] of iterator) {
      if (!value) {
        query.andWhere(key)

        continue
      }

      query.andWhere(key, value)
    }

    this.#where = new Map()
  }

  /**
   * Set all orderBy options in query if exists.
   *
   * @param query {import('typeorm').SelectQueryBuilder}
   */
  #setOrderByOnQuery(query) {
    if (!this.#orderBy.size) {
      return
    }

    const iterator = this.#orderBy.entries()

    for (const [key, value] of iterator) {
      query.addOrderBy(key, value)
    }

    this.#orderBy = new Map()
  }

  /**
   * Set all relations options in query if exists.
   *
   * @param query {import('typeorm').SelectQueryBuilder}
   */
  #setRelationsOnQuery(query) {
    if (!this.#relations.size) {
      return
    }

    const iterator = this.#relations.entries()

    for (const [key, value] of iterator) {
      const name = value.name
      const operation = value.operation

      query[operation](key, name)
    }

    this.#relations = new Map()
  }

  /**
   * Get the column param verifying if it has a "." to
   * set the table or not.
   *
   * @param column
   */
  #getColumnParam(column) {
    if (column.includes('.')) {
      return column
    }

    return `${this.#table}.${column}`
  }
}
