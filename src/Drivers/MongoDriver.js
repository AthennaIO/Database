/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Collection, Exec, Is, Json, Options } from '@athenna/common'

import { DriverFactory } from '#src/Factories/DriverFactory'
import { BadJoinException } from '#src/Exceptions/BadJoinException'
import { Transaction } from '#src/Database/Transactions/Transaction'
import { setOperator } from '#src/Constants/MongoOperationsDictionary'
import { WrongMethodException } from '#src/Exceptions/WrongMethodException'
import { NotFoundDataException } from '#src/Exceptions/NotFoundDataException'
import { NoTableSelectedException } from '#src/Exceptions/NoTableSelectedException'
import { NotConnectedDatabaseException } from '#src/Exceptions/NotConnectedDatabaseException'
import { NotImplementedMethodException } from '#src/Exceptions/NotImplementedMethodException'

export class MongoDriver {
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
   * Set the client of this driver.
   *
   * @type {import('mongoose').Mongoose.Connection}
   */
  #client = null

  /**
   * Set the session of this driver.
   *
   * @type {import('mongoose').Mongoose.ClientSession}
   */
  #session = null

  /**
   * The main query builder of driver.
   *
   * @type {import('mongoose').Mongoose.Collection}
   */
  #qb = null

  /**
   * The where clause used in update queries.
   *
   * @type {Record<string, any>}
   */
  #where = {}

  /**
   * The or where clause used in update queries.
   *
   * @type {Record<string, any>[]}
   */
  #orWhere = []

  /**
   * The aggregate pipeline to make mongo queries.
   *
   * @type {any[]}
   */
  #pipeline = [
    {
      $sort: { _id: 1 },
    },
  ]

  /**
   * Creates a new instance of MongoDriver.
   *
   * @param {string|any} connection
   * @param {any} [client]
   * @param {any} [session]
   * @return {Database}
   */
  constructor(connection, client = null, session = null) {
    this.#connection = connection

    if (client) {
      this.#isConnected = true
      this.#isSavedOnFactory = true
      this.#client = client
      this.#session = session
    }
  }

  /**
   * Return the client of driver.
   *
   * @return {import('mongoose').Mongoose.Connection|null}
   */
  getClient() {
    return this.#client
  }

  /**
   * Return the query builder of driver.
   *
   * @return {import('mongoose').Mongoose.Collection|null}
   */
  getQueryBuilder() {
    return this.#qb
  }

  /**
   * Set a query builder in driver.
   *
   * @return {MongoDriver}
   */
  setQueryBuilder(queryBuilder) {
    this.#qb = queryBuilder

    return this
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

    this.#client = await DriverFactory.createConnectionByDriver(
      'mongo',
      this.#connection,
      saveOnFactory,
    )

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
      await DriverFactory.closeConnectionByDriver('mongo')
    } else {
      await this.#client.close()
    }

    this.#qb = null
    this.#table = null
    this.#client = null
    this.#session = null
    this.#isConnected = false
  }

  /**
   * Creates a new instance of query builder.
   *
   * @return {import('mongoose').Mongoose.Collection}
   */
  query() {
    if (!this.#isConnected) {
      throw new NotConnectedDatabaseException()
    }

    if (!this.#table) {
      throw new NoTableSelectedException()
    }

    return this.#client.collection(this.#table)
  }

  /**
   * Create a new transaction.
   *
   * @return {Promise<Transaction>}
   */
  async startTransaction() {
    const session = await this.#client.startSession()

    session.startTransaction()

    return new Transaction(
      new MongoDriver(this.#connection, this.#client, session),
    )
  }

  /**
   * Commit the transaction.
   *
   * @return {Promise<void>}
   */
  async commitTransaction() {
    await this.#session.commitTransaction()
    await this.#session.endSession()

    this.#table = null
    this.#client = null
    this.#session = null
    this.#isConnected = false
  }

  /**
   * Rollback the transaction.
   *
   * @return {Promise<void>}
   */
  async rollbackTransaction() {
    if (!this.#session) {
      return
    }

    await this.#session.abortTransaction()
    await this.#session.endSession()

    this.#table = null
    this.#client = null
    this.#session = null
    this.#isConnected = false
  }

  /**
   * Run database migrations.
   *
   * @return {Promise<void>}
   */
  async runMigrations() {
    throw new NotImplementedMethodException(
      this.runMigrations.name,
      MongoDriver.name,
    )
  }

  /**
   * Revert database migrations.
   *
   * @return {Promise<void>}
   */
  async revertMigrations() {
    throw new NotImplementedMethodException(
      this.revertMigrations.name,
      MongoDriver.name,
    )
  }

  /**
   * List all databases available.
   *
   * @return {Promise<string[]>}
   */
  async getDatabases() {
    const admin = this.#client.db.admin()
    const { databases } = await admin.listDatabases()

    return databases.map(database => database.name)
  }

  /**
   * Get the current database name.
   *
   * @return {Promise<string | undefined>}
   */
  async getCurrentDatabase() {
    return this.#client.db.databaseName
  }

  /**
   * Verify if database exists.
   *
   * @param {string} database
   * @return {Promise<boolean>}
   */
  async hasDatabase(database) {
    const databases = await this.getDatabases()

    return databases.includes(database)
  }

  /**
   * Create a new database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async createDatabase(databaseName) {
    throw new NotImplementedMethodException(
      this.createDatabase.name,
      MongoDriver.name,
    )
  }

  /**
   * Drop some database.
   *
   * @param {string} databaseName
   * @return {Promise<void>}
   */
  async dropDatabase(databaseName) {
    await this.#client.useDb(databaseName).dropDatabase()
  }

  /**
   * List all tables available.
   *
   * @return {Promise<string[]>}
   */
  async getTables() {
    const collections = await this.#client.db.listCollections().toArray()

    return collections.map(collection => collection.name)
  }

  /**
   * Verify if table exists.
   *
   * @param {string} table
   * @return {Promise<boolean>}
   */
  async hasTable(table) {
    const tables = await this.getTables()

    return tables.includes(table)
  }

  /**
   * Create a new table in database.
   *
   * @param {string} tableName
   * @param {(builder: import('knex').Knex.TableBuilder) => void|Promise<void>} callback
   * @return {Promise<void>}
   */
  async createTable(tableName, callback) {
    throw new NotImplementedMethodException(
      this.createTable.name,
      MongoDriver.name,
    )
  }

  /**
   * Drop a table in database.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async dropTable(tableName) {
    try {
      await this.#client.dropCollection(tableName)
    } catch (err) {}
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   *
   * @param {string} tableName
   * @return {Promise<void>}
   */
  async truncate(tableName) {
    const collection = this.#client.collection(tableName)

    await collection.deleteMany({}, { session: this.#session })
  }

  /**
   * Make a raw query in database.
   *
   * @param {string} sql
   * @param {any} [bindings]
   * @return {any | Promise<any>}
   */
  raw(sql, bindings) {
    throw new NotImplementedMethodException(this.raw.name, MongoDriver.name)
  }

  /**
   * Calculate the average of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async avg(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, avg: { $avg: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, avg: 1 } })

    const [{ avg }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${avg}`
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async avgDistinct(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, avg: { $avg: '$set' } } })

    const [{ avg }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${avg}`
  }

  /**
   * Get the max number of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async max(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, max: { $max: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, max: 1 } })

    const [{ max }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${max}`
  }

  /**
   * Get the min number of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async min(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, min: { $min: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, min: 1 } })

    const [{ min }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${min}`
  }

  /**
   * Sum all numbers of a given column.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async sum(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, sum: { $sum: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, sum: 1 } })

    const [{ sum }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${sum}`
  }

  /**
   * Sum all numbers of a given column in distinct mode.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async sumDistinct(column) {
    const pipeline = this.#createPipeline()

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, sum: { $sum: '$set' } } })

    const [{ sum }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${sum}`
  }

  /**
   * Increment a value of a given column.
   *
   * @param {string} column
   * @return {Promise<void>}
   */
  async increment(column) {
    const where = this.#createWhere()

    await this.#qb.updateMany(
      where,
      { $inc: { [column]: 1 } },
      { session: this.#session, upsert: false },
    )
  }

  /**
   * Decrement a value of a given column.
   *
   * @param {string} column
   * @return {Promise<void>}
   */
  async decrement(column) {
    const where = this.#createWhere()

    await this.#qb.updateMany(
      where,
      { $inc: { [column]: -1 } },
      { session: this.#session, upsert: false },
    )
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async count(column = '*') {
    const pipeline = this.#createPipeline()

    if (column !== '*') {
      pipeline.push({ $match: { [column]: { $ne: null } } })
    }

    pipeline.push({ $group: { _id: null, count: { $sum: 1 } } })
    pipeline.push({ $project: { _id: 0, count: 1 } })

    const [{ count }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${count}`
  }

  /**
   * Calculate the average of a given column using distinct.
   *
   * @param {string} column
   * @return {Promise<string>}
   */
  async countDistinct(column) {
    const pipeline = this.#createPipeline()

    if (column !== '*') {
      pipeline.push({ $match: { [column]: { $ne: null } } })
    }

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, count: { $size: `$set` } } })

    const [{ count }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return `${count}`
  }

  /**
   * Find a value in database or throw exception if undefined.
   *
   * @return {Promise<any>}
   */
  async findOrFail() {
    const data = await this.find()

    if (!data) {
      throw new NotFoundDataException(this.#connection)
    }

    return data
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   *
   * @param callback {() => Promise<any>}
   * @return {Promise<any>}
   */
  async findOr(callback) {
    const data = await this.find()

    if (!data) {
      return callback()
    }

    return data
  }

  /**
   * Find a value in database.
   *
   * @return {Promise<any>}
   */
  async find() {
    const pipeline = this.#createPipeline()

    const data = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    return data[0]
  }

  /**
   * Find many values in database.
   *
   * @return {Promise<any>}
   */
  async findMany() {
    const pipeline = this.#createPipeline()

    return this.#qb.aggregate(pipeline, { session: this.#session }).toArray()
  }

  /**
   * Find many values in database and return as a Collection.
   *
   * @return {Promise<Collection>}
   */
  async collection() {
    return new Collection(await this.findMany())
  }

  /**
   * Find many values in database and return as paginated response.
   *
   * @param [page] {boolean}
   * @param [limit] {boolean}
   * @param [resourceUrl] {string}
   * @return {Promise<import('@athenna/common').PaginatedResponse>}
   */
  async paginate(page = 0, limit = 10, resourceUrl = '/') {
    const pipeline = this.#createPipeline({
      clearWhere: false,
      clearOrWhere: false,
      clearPipeline: false,
    })

    pipeline.push({ $group: { _id: null, count: { $sum: 1 } } })
    pipeline.push({ $project: { _id: 0, count: 1 } })

    const [{ count }] = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    const data = await this.offset(page).limit(limit).findMany()

    return Exec.pagination(data, count, { page, limit, resourceUrl })
  }

  /**
   * Create a value in database.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  async create(data, primaryKey = '_id') {
    if (Is.Array(data)) {
      throw new WrongMethodException('create', 'createMany')
    }

    const created = await this.createMany([data], primaryKey)

    return created[0]
  }

  /**
   * Create many values in database.
   *
   * @param {any[]} data
   * @param {string} [primaryKey]
   * @return {Promise<any>}
   */
  async createMany(data, primaryKey = '_id') {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    const { insertedIds } = await this.#qb.insertMany(data)

    const insertedIdsArray = []

    Object.keys(insertedIds).forEach(key =>
      insertedIdsArray.push(insertedIds[key]),
    )

    return this.whereIn(primaryKey, insertedIdsArray).findMany()
  }

  /**
   * Create data or update if already exists.
   *
   * @param {any} data
   * @param {string} [primaryKey]
   * @return {Promise<any | any[]>}
   */
  async createOrUpdate(data, primaryKey = '_id') {
    const pipeline = this.#createPipeline()

    const hasValue = (
      await this.#qb.aggregate(pipeline, { session: this.#session }).toArray()
    )[0]

    if (hasValue) {
      return this.where(primaryKey, hasValue[primaryKey]).update(data)
    }

    return this.create(data, primaryKey)
  }

  /**
   * Update data in database.
   *
   * @param {any} data
   * @return {Promise<any>}
   */
  async update(data) {
    const where = this.#createWhere({ clearWhere: false, clearOrWhere: false })
    const pipeline = this.#createPipeline()

    await this.#qb.updateMany(
      where,
      { $set: data },
      { upsert: false, session: this.#session },
    )

    const result = await this.#qb
      .aggregate(pipeline, { session: this.#session })
      .toArray()

    if (result.length === 1) {
      return result[0]
    }

    return result
  }

  /**
   * Delete data in database.
   *
   * @return {Promise<void>}
   */
  async delete() {
    await this.#qb.deleteMany(this.#createWhere(), { session: this.#session })
  }

  /**
   * Set the table that this query will be executed.
   *
   * @param tableName {string|any}
   * @return {MongoDriver}
   */
  table(tableName) {
    if (!this.#isConnected) {
      throw new NotConnectedDatabaseException()
    }

    this.#table = tableName
    this.#qb = this.query()

    return this
  }

  /**
   * Log in console the actual query built.
   *
   * @return {MongoDriver}
   */
  dump() {
    console.log('where:', this.#where)
    console.log('orWhere:', this.#orWhere)
    console.log('pipeline:', this.#pipeline)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   *
   * @param criteria {any}
   * @param callback {(query: MongoDriver, criteriaValue: any) => void}
   */
  when(criteria, callback) {
    if (!criteria) {
      return this
    }

    // eslint-disable-next-line n/no-callback-literal
    callback(this, criteria)

    return this
  }

  /**
   * Set the columns that should be selected on query.
   *
   * @param columns {string}
   * @return {MongoDriver}
   */
  select(...columns) {
    if (columns.includes('*')) {
      return this
    }

    const $project = columns.reduce((previous, column) => {
      if (column.includes(`${this.#table}.`)) {
        column = column.replace(`${this.#table}.`, '')
      }

      if (column.includes(' as ')) {
        const [select, alias] = column.split(' as ')

        previous[select] = 0
        previous[alias] = `$${select}`

        return previous
      }

      previous[column] = 1

      return previous
    }, {})

    this.#pipeline.push({ $project })

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   *
   * @param sql {string}
   * @param bindings {any}
   * @return {MongoDriver}
   */
  selectRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.selectRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  join(tableName, column1, operation, column2) {
    let foreignField = column2 || operation || '_id'

    if (foreignField.includes('.')) {
      const [table, column] = foreignField.split('.')

      if (table !== tableName) {
        throw new BadJoinException(foreignField, tableName)
      }

      foreignField = column
    }

    let localField = column1 || '_id'

    if (localField.includes('.')) {
      localField = localField.split('.')[1]
    }

    this.#pipeline.push({
      $lookup: { from: tableName, localField, foreignField, as: tableName },
    })

    return this
  }

  /**
   * Set a left join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  leftJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a right join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  rightJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a cross join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  crossJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a full outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  fullOuterJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a left outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  leftOuterJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a right outer join statement in your query.
   *
   * @param tableName {any}
   * @param [column1] {any}
   * @param [operation] {any}
   * @param [column2] {any}
   * @return {MongoDriver}
   */
  rightOuterJoin(tableName, column1, operation, column2) {
    return this.join(tableName, column1, operation, column2)
  }

  /**
   * Set a join raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  joinRaw(sql, bindings) {
    throw new NotImplementedMethodException(this.joinRaw.name, MongoDriver.name)
  }

  /**
   * Set a group by statement in your query.
   *
   * @param columns {string}
   * @return {MongoDriver}
   */
  groupBy(...columns) {
    const $group = { _id: {} }

    columns.forEach(column => ($group._id[column] = `$${column}`))

    this.#pipeline.push({ $group })
    this.#pipeline.push({ $replaceRoot: { newRoot: '$_id' } })

    return this
  }

  /**
   * Set a group by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  groupByRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.groupByRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a having statement in your query.
   *
   * @param column {any}
   * @param [operation] {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  having(column, operation, value) {
    return this.where(column, operation, value)
  }

  /**
   * Set a having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  havingRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.havingRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a having exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  havingExists(clause) {
    throw new NotImplementedMethodException(
      this.havingExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a having not exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  havingNotExists(clause) {
    throw new NotImplementedMethodException(
      this.havingNotExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  havingIn(columnName, values) {
    return this.whereIn(columnName, values)
  }

  /**
   * Set a having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  havingNotIn(columnName, values) {
    return this.whereNotIn(columnName, values)
  }

  /**
   * Set a having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  havingBetween(columnName, values) {
    return this.whereBetween(columnName, values)
  }

  /**
   * Set a having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  havingNotBetween(columnName, values) {
    return this.whereNotBetween(columnName, values)
  }

  /**
   * Set a having null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  havingNull(columnName) {
    return this.whereNull(columnName)
  }

  /**
   * Set a having not null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  havingNotNull(columnName) {
    return this.whereNotNull(columnName)
  }

  /**
   * Set an or having statement in your query.
   *
   * @param column {any}
   * @param [operation] {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  orHaving(column, operation, value) {
    return this.orWhere(column, operation, value)
  }

  /**
   * Set an or having raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  orHavingRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.orHavingRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or having exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  orHavingExists(clause) {
    throw new NotImplementedMethodException(
      this.orHavingExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or having not exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  orHavingNotExists(clause) {
    throw new NotImplementedMethodException(
      this.orHavingNotExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or having in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  orHavingIn(columnName, values) {
    return this.orWhereIn(columnName, values)
  }

  /**
   * Set an or having not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  orHavingNotIn(columnName, values) {
    return this.orWhereNotIn(columnName, values)
  }

  /**
   * Set an or having between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  orHavingBetween(columnName, values) {
    return this.orWhereBetween(columnName, values)
  }

  /**
   * Set an or having not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  orHavingNotBetween(columnName, values) {
    return this.orWhereNotBetween(columnName, values)
  }

  /**
   * Set an or having null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  orHavingNull(columnName) {
    return this.whereNull(columnName)
  }

  /**
   * Set an or having not null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  orHavingNotNull(columnName) {
    return this.whereNotNull(columnName)
  }

  /**
   * Set a where statement in your query.
   *
   * @param statement {any}
   * @param [operation] {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  where(statement, operation, value) {
    if (Is.Function(statement)) {
      statement(this)

      return this
    }

    if (operation === undefined) {
      this.#where = {
        ...this.#where,
        ...statement,
      }

      return this
    }

    if (value === undefined) {
      this.#where[statement] = setOperator(operation, '=')

      return this
    }

    this.#where[statement] = setOperator(value, operation)

    return this
  }

  /**
   * Set a where not statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  whereNot(statement, value) {
    return this.where(statement, '<>', value)
  }

  /**
   * Set a where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  whereRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.whereRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a where exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  whereExists(clause) {
    throw new NotImplementedMethodException(
      this.whereExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a where not exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  whereNotExists(clause) {
    throw new NotImplementedMethodException(
      this.whereNotExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set a where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  whereLike(statement, value) {
    return this.where(statement, 'like', value)
  }

  /**
   * Set a where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  whereILike(statement, value) {
    return this.where(statement, 'ilike', value)
  }

  /**
   * Set a where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  whereIn(columnName, values) {
    this.#where[columnName] = { $in: values }

    return this
  }

  /**
   * Set a where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  whereNotIn(columnName, values) {
    this.#where[columnName] = { $nin: values }

    return this
  }

  /**
   * Set a where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  whereBetween(columnName, values) {
    this.#where[columnName] = { $gte: values[0], $lte: values[1] }

    return this
  }

  /**
   * Set a where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  whereNotBetween(columnName, values) {
    this.#where[columnName] = { $not: { $gte: values[0], $lte: values[1] } }

    return this
  }

  /**
   * Set a where null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  whereNull(columnName) {
    this.#where[columnName] = null

    return this
  }

  /**
   * Set a where not null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  whereNotNull(columnName) {
    this.#where[columnName] = { $ne: null }

    return this
  }

  /**
   * Set a or where statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [operation] {string|Record<string, any>}
   * @param [value] {Record<string, any>}
   * @return {MongoDriver}
   */
  orWhere(statement, operation, value) {
    if (Is.Function(statement)) {
      statement(this)

      return this
    }

    if (operation === undefined) {
      this.#orWhere.push(statement)

      return this
    }

    if (value === undefined) {
      this.#orWhere.push({ [statement]: setOperator(operation, '=') })

      return this
    }

    this.#orWhere.push({ [statement]: setOperator(value, operation) })

    return this
  }

  /**
   * Set an or where not statement in your query.
   *
   * @param statement {string|Record<string, any>}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  orWhereNot(statement, value) {
    return this.orWhere(statement, '<>', value)
  }

  /**
   * Set a or where raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  orWhereRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.orWhereRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or where exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  orWhereExists(clause) {
    throw new NotImplementedMethodException(
      this.orWhereExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or where not exists statement in your query.
   *
   * @param clause {any}
   * @return {MongoDriver}
   */
  orWhereNotExists(clause) {
    throw new NotImplementedMethodException(
      this.orWhereNotExists.name,
      MongoDriver.name,
    )
  }

  /**
   * Set an or where like statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  orWhereLike(statement, value) {
    return this.orWhere(statement, 'like', value)
  }

  /**
   * Set an or where ILike statement in your query.
   *
   * @param statement {any}
   * @param [value] {any}
   * @return {MongoDriver}
   */
  orWhereILike(statement, value) {
    return this.orWhere(statement, 'ilike', value)
  }

  /**
   * Set an or where in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  orWhereIn(columnName, values) {
    this.#orWhere.push({ [columnName]: { $in: values } })

    return this
  }

  /**
   * Set an or where not in statement in your query.
   *
   * @param columnName {string}
   * @param values {any[]}
   * @return {MongoDriver}
   */
  orWhereNotIn(columnName, values) {
    this.#orWhere.push({ [columnName]: { $nin: values } })

    return this
  }

  /**
   * Set an or where between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  orWhereBetween(columnName, values) {
    this.#orWhere.push({ [columnName]: { $gte: values[0], $lte: values[1] } })

    return this
  }

  /**
   * Set an or where not between statement in your query.
   *
   * @param columnName {string}
   * @param values {[any, any]}
   * @return {MongoDriver}
   */
  orWhereNotBetween(columnName, values) {
    this.#orWhere.push({
      [columnName]: { $not: { $gte: values[0], $lte: values[1] } },
    })

    return this
  }

  /**
   * Set an or where null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  orWhereNull(columnName) {
    this.#orWhere.push({ [columnName]: null })

    return this
  }

  /**
   * Set an or where not null statement in your query.
   *
   * @param columnName {string}
   * @return {MongoDriver}
   */
  orWhereNotNull(columnName) {
    this.#orWhere.push({ [columnName]: { $ne: null } })

    return this
  }

  /**
   * Set an order by statement in your query.
   *
   * @param columnName {string}
   * @param [direction] {'asc'|'desc'|'ASC'|'DESC'}
   * @return {MongoDriver}
   */
  orderBy(columnName, direction = 'ASC') {
    direction = direction.toLowerCase()

    this.#pipeline.push({
      $sort: { [columnName]: direction === 'asc' ? 1 : -1 },
    })

    return this
  }

  /**
   * Set an order by raw statement in your query.
   *
   * @param sql {string}
   * @param [bindings] {any}
   * @return {MongoDriver}
   */
  orderByRaw(sql, bindings) {
    throw new NotImplementedMethodException(
      this.orderByRaw.name,
      MongoDriver.name,
    )
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {MongoDriver}
   */
  latest(columnName = 'createdAt') {
    return this.orderBy(columnName, 'DESC')
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   *
   * @param [columnName] {string}
   * @return {MongoDriver}
   */
  oldest(columnName = 'createdAt') {
    return this.orderBy(columnName, 'ASC')
  }

  /**
   * Set the skip number in your query.
   *
   * @param number {number}
   * @return {MongoDriver}
   */
  offset(number) {
    this.#pipeline.push({ $skip: number })

    return this
  }

  /**
   * Set the limit number in your query.
   *
   * @param number {number}
   * @return {MongoDriver}
   */
  limit(number) {
    this.#pipeline.push({ $limit: number })

    return this
  }

  /**
   * Creates the where clause with where and orWhere.
   *
   * @param [options] {{ clearPipeline?: boolean, clearWhere?: boolean, clearOrWhere?: boolean }}
   * @return {any}
   */
  #createWhere(options) {
    options = Options.create(options, {
      clearWhere: true,
      clearOrWhere: true,
    })

    if (Is.Empty(this.#orWhere)) {
      const where = Json.copy(this.#where)

      if (options.clearWhere) {
        this.#where = {}
      }

      return where
    }

    const where = { $or: [Json.copy(this.#where), ...Json.copy(this.#orWhere)] }

    if (options.clearWhere) {
      this.#where = {}
    }

    if (options.clearOrWhere) {
      this.#orWhere = []
    }

    return where
  }

  /**
   * Creates the aggregation pipeline.
   *
   * @param [options] {{ clearPipeline?: boolean, clearWhere?: boolean, clearOrWhere?: boolean }}
   * @return {any[]}
   */
  #createPipeline(options) {
    options = Options.create(options, {
      clearWhere: true,
      clearOrWhere: true,
      clearPipeline: true,
    })

    const pipeline = [...this.#pipeline]

    if (options.clearPipeline) {
      this.#pipeline = []
    }

    if (!Is.Empty(this.#where)) {
      let $match = Json.copy(this.#where)

      if (!Is.Empty(this.#orWhere)) {
        $match = { $or: [Json.copy(this.#where), ...Json.copy(this.#orWhere)] }
      }

      pipeline.push({ $match })
    }

    if (options.clearWhere) {
      this.#where = {}
    }

    if (options.clearOrWhere) {
      this.#orWhere = []
    }

    return pipeline
  }
}
