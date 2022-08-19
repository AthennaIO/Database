import { Table } from 'typeorm'

import { DriverFactory } from '#src/Factories/DriverFactory'
import { EmptyWhereException } from '#src/Exceptions/EmptyWhereException'
import { NoTableSelectedException } from '#src/Exceptions/NoTableSelectedException'

export class PostgresDriver {
  /**
   * Set if this instance is connected with database.
   *
   * @type {boolean}
   */
  #isConnected = false

  /**
   * The client responsible to handle database operations.
   *
   * @type {import('typeorm').DataSource|null}
   */
  #client = null

  /**
   * The runtime configurations for this instance.
   *
   * @type {any}
   */
  #configs = {}

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
   * @type {any}
   */
  #relations = {}

  /**
   * Connect to database.
   *
   * @param {boolean} force
   * @param {boolean} saveOnDriver
   * @return {Promise<void>}
   */
  async connect(force = false, saveOnDriver = true) {
    if (this.#isConnected && !force) {
      return
    }

    this.#client = await DriverFactory.createConnectionByDriver(
      'postgres',
      this.#connection,
      this.#configs,
      saveOnDriver,
    )

    this.#isConnected = true
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

    await this.#client.destroy()

    this.#table = null
    this.#client = null
    this.#isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   *
   * @return {import('typeorm').SelectQueryBuilder}
   */
  async query() {
    if (!this.#table) {
      throw new NoTableSelectedException()
    }

    /** @type {import('typeorm').SelectQueryBuilder} */
    const query = this.#client.createQueryBuilder()

    query.from(this.#table)

    if (this.#select.length) {
      query.select(this.#select)
    }

    if (this.#skip) {
      query.skip(this.#skip)
    }

    if (this.#limit) {
      query.skip(this.#limit)
    }

    if (this.#where.size > 0) {
      const iterator = this.#where.entries()

      while (iterator.done) {
        if (!iterator.value[1]) {
          query.where(iterator.value[0])
        } else {
          query.where(iterator.value[0], iterator.value[1])
        }

        iterator.next()
      }
    }

    if (this.#orderBy.size > 0) {
      const iterator = this.#orderBy.entries()

      while (iterator.done) {
        query.addOrderBy(iterator.value[0], iterator.value[1])

        iterator.next()
      }
    }

    return query
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    await this.#client.query('CREATE DATABASE ??', [databaseName])
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    await this.#client.query('DROP DATABASE IF EXISTS ??', [databaseName])
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {import('typeorm').TableOptions} options
   * @return {Promise<void>}
   */
  async createTable(tableName, options) {
    const queryRunner = this.#client.createQueryRunner()

    await queryRunner.createTable(
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
    const queryRunner = this.#client.createQueryRunner()

    await queryRunner.dropTable(tableName, true)
  }

  /**
   * Get metadata information's about some database table.
   *
   * @param {string} table
   * @return {Promise<import('typeorm').EntityMetadata>}
   */
  async tableInfo(table) {
    return this.#client.getMetadata(table)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    await this.raw('TRUNCATE ?? RESTART IDENTITY CASCADE', [tableName])
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} raw
   * @param {any[]} [queryValues]
   * @return {Promise<any>}
   */
  async raw(raw, queryValues) {
    return this.#client?.query(raw, queryValues)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avg(column) {
    const { avg } = await this.query()
      .select(`AVG(${column})`, 'avg')
      .getRawOne()

    return avg
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async avgDistinct(column) {
    const { avg } = await this.query()
      .select(`AVG(${column})`, 'avg')
      .distinct(true)
      .getRawOne()

    return avg
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async max(column) {
    const { max } = await this.query()
      .select(`MAX(${column})`, 'max')
      .getRawOne()

    return max
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async min(column) {
    const { min } = await this.query()
      .select(`MIN(${column})`, 'min')
      .getRawOne()

    return min
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sum(column) {
    const { sum } = await this.query()
      .select(`SUM(${column})`, 'sum')
      .getRawOne()

    return sum
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async sumDistinct(column) {
    const { sum } = await this.query()
      .select(`SUM(${column})`, 'sum')
      .distinct(true)
      .getRawOne()

    return sum
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async increment(column) {
    return this.query()
      .update()
      .set({ [column]: () => `${column} + 1` })
      .execute()
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<number>}
   */
  async decrement(column) {
    return this.query()
      .update()
      .set({ [column]: () => `${column} - 1` })
      .execute()
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
      const [_, count] = await this.query().getManyAndCount()

      return count
    }

    const { count } = await this.query()
      .select(`COUNT(${column})`, 'count')
      .getRawOne()

    return count
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
      const [_, count] = await this.query()
        .select()
        .distinct(true)
        .getManyAndCount()

      return count
    }

    const { count } = await this.query()
      .select(`COUNT(${column})`, 'count')
      .distinct(true)
      .getRawOne()

    return count
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    const data = await this.query().limit(1).execute()

    return data[0]
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    return this.query().execute()
  }

  /**
   * Update a value in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async update(data) {
    if (!this.#where.size) {
      throw new EmptyWhereException('update', 'updateMany')
    }

    return this.query().update().set(data).execute()
  }

  /**
   * Update many values in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async updateMany(data) {
    return this.query().update().set(data).execute()
  }

  /**
   * Delete one value in database.
   *
   * @return {Promise<void>}
   */
  async delete(soft = false) {
    if (!this.#where.size) {
      throw new EmptyWhereException('delete', 'deleteMany')
    }

    if (soft) {
      return this.query().softDelete().execute()
    }

    return this.query().delete().execute()
  }

  /**
   * Delete many values in database.
   *
   * @return {Promise<void>}
   */
  async deleteMany(soft = false) {
    if (soft) {
      return this.query().softDelete().execute()
    }

    return this.query().delete().execute()
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {PostgresDriver}
   */
  buildTable(tableName) {
    this.#table = tableName

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {PostgresDriver}
   */
  buildSelect(...columns) {
    columns.forEach(column => this.#select.push(`${this.#table}.${column}`))

    return this
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  buildWhere(statement, value) {
    return this.#buildWhere('=', statement, value)
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
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
   * @return {PostgresDriver}
   */
  buildWhereILike(statement, value) {
    if (!value.includes('%')) {
      value = `%${value}%`
    }

    return this.#buildWhere('ILIKE', statement, value)
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {PostgresDriver}
   */
  buildWhereNot(statement, value) {
    return this.#buildWhere('!=', statement, value)
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  buildWhereIn(columnName, values) {
    return this.#buildWhere('IN', columnName, values)
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {PostgresDriver}
   */
  buildWhereNotIn(columnName, values) {
    return this.#buildWhere('NOT IN', columnName, values)
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  buildWhereNull(columnName) {
    return this.#buildWhere('IS NULL', columnName)
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {PostgresDriver}
   */
  buildWhereNotNull(columnName) {
    return this.#buildWhere('IS NOT NULL', columnName)
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  buildWhereBetween(columnName, values) {
    return this.#buildWhere('BETWEEN', columnName, values)
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {PostgresDriver}
   */
  buildWhereNotBetween(columnName, values) {
    return this.#buildWhere('NOT BETWEEN', columnName, values)
  }

  /**
   * Set a order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {PostgresDriver}
   */
  buildOrderBy(columnName, direction = 'ASC') {
    this.#orderBy[columnName] = direction.toUpperCase()

    return this
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {PostgresDriver}
   */
  buildSkip(number) {
    this.#skip = number

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {PostgresDriver}
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
      return `${
        this.#table
      }.${fieldName} ${operation} :${fieldName}Gte and :${fieldName}Lte`
    }

    if (operation === 'IS NULL' || operation === 'IS NOT NULL') {
      return `${this.#table}.${fieldName} ${operation}`
    }

    if (operation === 'IN' || operation === 'NOT IN') {
      return `${this.#table}.${fieldName} ${operation}(:...${fieldName})`
    }

    return `${this.#table}.${fieldName} ${operation} :${fieldName}`
  }

  /**
   * Build where used by all other methods.
   *
   * @param operation {string}
   * @param statement {string}
   * @param [value] {any}
   * @return {PostgresDriver}
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
}
