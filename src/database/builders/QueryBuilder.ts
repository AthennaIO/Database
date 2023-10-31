/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Direction } from '#src/types'
import type { Driver } from '#src/drivers/Driver'
import type { Collection, PaginatedResponse } from '@athenna/common'

export class QueryBuilder<Client = any, QB = any> {
  /**
   * The drivers responsible for handling database operations.
   */
  private driver: Driver<Client, QB>

  /**
   * Creates a new instance of QueryBuilder.
   */
  public constructor(driver: Driver, tableName: string) {
    this.driver = driver
    this.driver.table(tableName)
  }

  /**
   * Return the client of driver.
   */
  public getClient(): Client {
    return this.driver.getClient()
  }

  /**
   * Return the query builder of driver.
   */
  public getQueryBuilder(): QB {
    return this.driver.getQueryBuilder()
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: string): Promise<string> {
    return this.driver.avg(column)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: string): Promise<string> {
    return this.driver.avgDistinct(column)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: string): Promise<string> {
    return this.driver.max(column)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: string): Promise<string> {
    return this.driver.min(column)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: string): Promise<string> {
    return this.driver.sum(column)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: string): Promise<string> {
    return this.driver.sumDistinct(column)
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: string): Promise<void> {
    await this.driver.increment(column)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: string): Promise<void> {
    await this.driver.decrement(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column: string = '*'): Promise<string> {
    return this.driver.count(column)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: string): Promise<string> {
    return this.driver.countDistinct(column)
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public async findOrFail<T = any>(): Promise<T> {
    return this.driver.findOrFail()
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   */
  public async findOr<T = any>(callback: () => Promise<T>): Promise<T> {
    return this.driver.findOr(callback)
  }

  /**
   * Find a value in database.
   */
  public async find<T = any>(): Promise<T> {
    return this.driver.find()
  }

  /**
   * Find many values in database.
   */
  public async findMany<T = any>(): Promise<T[]> {
    return this.driver.findMany()
  }

  /**
   * Find many values in database and return as a Collection.
   */
  public async collection<T = any>(): Promise<Collection<T>> {
    return this.driver.collection()
  }

  /**
   * Find many values in database and return as paginated response.
   */
  public async paginate(
    page = 0,
    limit = 10,
    resourceUrl = '/'
  ): Promise<PaginatedResponse> {
    return this.driver.paginate(page, limit, resourceUrl)
  }

  /**
   * Create a value in database.
   */
  public async create<T = any>(
    data?: Partial<T>,
    primaryKey?: string
  ): Promise<T> {
    return this.driver.create(data, primaryKey)
  }

  /**
   * Create many values in database.
   */
  public async createMany<T = any>(
    data?: Partial<T>[],
    primaryKey?: string
  ): Promise<T[]> {
    return this.driver.createMany(data, primaryKey)
  }

  /**
   * Create data or update if already exists.
   */
  public async createOrUpdate<T = any>(
    data?: Partial<T>,
    primaryKey?: string
  ): Promise<T | T[]> {
    return this.driver.createOrUpdate(data, primaryKey)
  }

  /**
   * Update data in database.
   */
  public async update<T = any>(data: Partial<T>): Promise<T | T[]> {
    return this.driver.update(data)
  }

  /**
   * Delete data in database.
   */
  public async delete<T = any>(): Promise<T | T[] | void> {
    return this.driver.delete()
  }

  /**
   * Make a raw query in database.
   */
  public raw(sql: string, bindings?: any) {
    return this.driver.raw(sql, bindings)
  }

  /**
   * Set a new table to work with in query builder.
   */
  public table(tableName: string): QueryBuilder {
    this.driver.table(tableName)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   */
  public when(
    criteria: any,
    closure: (query: QueryBuilder, criteriaValue: any) => void
  ): QueryBuilder {
    if (criteria) {
      closure(this, criteria)

      return this
    }

    return this
  }

  /**
   * Log in console the actual query built.
   */
  public dump(): QueryBuilder {
    this.driver.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: string[]): QueryBuilder {
    this.driver.select(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.selectRaw(sql, bindings)

    return this
  }

  /**
   * Set a join statement in your query.
   */
  public join(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.join(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a left join statement in your query.
   */
  public leftJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.leftJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a right join statement in your query.
   */
  public rightJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.rightJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a cross join statement in your query.
   */
  public crossJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.crossJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a full outer join statement in your query.
   */
  public fullOuterJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.fullOuterJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a left outer join statement in your query.
   */
  public leftOuterJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.leftOuterJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a right outer join statement in your query.
   */
  public rightOuterJoin(
    tableName: string,
    column1?: any,
    operation?: any,
    column2?: any
  ): QueryBuilder {
    this.driver.rightOuterJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a join raw statement in your query.
   */
  public joinRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: string[]): QueryBuilder {
    this.driver.groupBy(...columns)

    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public groupByRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.groupByRaw(sql, bindings)

    return this
  }

  /**
   * Set a having statement in your query.
   */
  public having(
    column: string,
    operation?: string | any,
    value?: any
  ): QueryBuilder {
    this.driver.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   */
  public havingRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   */
  public havingExists(builder: QueryBuilder): QueryBuilder {
    this.driver.havingExists(builder)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   */
  public havingNotExists(builder: QueryBuilder): QueryBuilder {
    this.driver.havingNotExists(builder)

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: string, values: any[]): QueryBuilder {
    this.driver.havingIn(column, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: string, values: any[]): QueryBuilder {
    this.driver.havingNotIn(column, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.havingBetween(column, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.havingNotBetween(column, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: string): QueryBuilder {
    this.driver.havingNull(column)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: string): QueryBuilder {
    this.driver.havingNotNull(column)

    return this
  }

  /**
   * Set an or having statement in your query.
   */
  public orHaving(
    column: string,
    operation?: string | any,
    value?: any
  ): QueryBuilder {
    this.driver.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   */
  public orHavingRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   */
  public orHavingExists(builder: QueryBuilder): QueryBuilder {
    this.driver.orHavingExists(builder)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public orHavingNotExists(builder: QueryBuilder): QueryBuilder {
    this.driver.orHavingNotExists(builder)

    return this
  }

  /**
   * Set an or having in statement in your query.
   */
  public orHavingIn(column: string, values: any[]): QueryBuilder {
    this.driver.orHavingIn(column, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   */
  public orHavingNotIn(column: string, values: any[]): QueryBuilder {
    this.driver.orHavingNotIn(column, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   */
  public orHavingBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.orHavingBetween(column, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   */
  public orHavingNotBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.orHavingNotBetween(column, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   */
  public orHavingNull(column: string): QueryBuilder {
    this.driver.orHavingNull(column)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   */
  public orHavingNotNull(column: string): QueryBuilder {
    this.driver.orHavingNotNull(column)

    return this
  }

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: any, value?: any): QueryBuilder {
    this.driver.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   */
  public whereNot(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   */
  public whereRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   */
  public whereExists(builder: QueryBuilder): QueryBuilder {
    this.driver.whereExists(builder)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   */
  public whereNotExists(builder: QueryBuilder): QueryBuilder {
    this.driver.whereNotExists(builder)

    return this
  }

  /**
   * Set a where like statement in your query.
   */
  public whereLike(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: string, values: any[]): QueryBuilder {
    this.driver.whereIn(column, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: string, values: any[]): QueryBuilder {
    this.driver.whereNotIn(column, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.whereBetween(column, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.whereNotBetween(column, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: string): QueryBuilder {
    this.driver.whereNull(column)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: string): QueryBuilder {
    this.driver.whereNotNull(column)

    return this
  }

  /**
   * Set a or where statement in your query.
   */
  public orWhere(statement: any, operation?: any, value?: any): QueryBuilder {
    this.driver.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   */
  public orWhereNot(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   */
  public orWhereRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   */
  public orWhereExists(builder: QueryBuilder): QueryBuilder {
    this.driver.orWhereExists(builder)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public orWhereNotExists(builder: QueryBuilder): QueryBuilder {
    this.driver.orWhereNotExists(builder)

    return this
  }

  /**
   * Set an or where like statement in your query.
   */
  public orWhereLike(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   */
  public orWhereILike(
    statement: string | Record<string, any>,
    value?: any
  ): QueryBuilder {
    this.driver.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   */
  public orWhereIn(column: string, values: any[]): QueryBuilder {
    this.driver.orWhereIn(column, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public orWhereNotIn(column: string, values: any[]): QueryBuilder {
    this.driver.orWhereNotIn(column, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public orWhereBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.orWhereBetween(column, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public orWhereNotBetween(column: string, values: [any, any]): QueryBuilder {
    this.driver.orWhereNotBetween(column, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public orWhereNull(column: string): QueryBuilder {
    this.driver.orWhereNull(column)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public orWhereNotNull(column: string): QueryBuilder {
    this.driver.orWhereNotNull(column)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: string, direction: Direction = 'ASC'): QueryBuilder {
    this.driver.orderBy(column, direction.toUpperCase() as Direction)

    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public orderByRaw(sql: string, bindings?: any): QueryBuilder {
    this.driver.orderByRaw(sql, bindings)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column = 'createdAt'): QueryBuilder {
    this.driver.latest(column)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public oldest(column = 'createdAt'): QueryBuilder {
    this.driver.oldest(column)

    return this
  }

  /**
   * Set the skip number in your query.
   */
  public offset(number: number): QueryBuilder {
    this.driver.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   */
  public limit(number: number): QueryBuilder {
    this.driver.limit(number)

    return this
  }
}
