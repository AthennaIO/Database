/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Direction } from '#src/types'
import type { Driver as DriverImpl } from '#src/drivers/Driver'
import type { Collection, PaginatedResponse } from '@athenna/common'

export class QueryBuilder<T = any, Driver extends DriverImpl = any> {
  /**
   * The drivers responsible for handling database operations.
   */
  private driver: Driver

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
  public getClient() {
    return this.driver.getClient()
  }

  /**
   * Return the query builder of driver.
   */
  public getQueryBuilder() {
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
  public async findOrFail(): Promise<T> {
    return this.driver.findOrFail()
  }

  /**
   * Return a single model instance or, if no results are found,
   * execute the given closure.
   */
  public async findOr(callback: () => Promise<T>): Promise<T> {
    return this.driver.findOr(callback)
  }

  /**
   * Find a value in database.
   */
  public async find(): Promise<T> {
    return this.driver.find()
  }

  /**
   * Find many values in database.
   */
  public async findMany(): Promise<T[]> {
    return this.driver.findMany()
  }

  /**
   * Find many values in database and return as a Collection.
   */
  public async collection(): Promise<Collection<T>> {
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
  public async create(data?: Partial<T>): Promise<T> {
    return this.driver.create(data)
  }

  /**
   * Create many values in database.
   */
  public async createMany(data?: Partial<T>[]): Promise<T[]> {
    return this.driver.createMany(data)
  }

  /**
   * Create data or update if already exists.
   */
  public async createOrUpdate(data?: Partial<T>): Promise<T | T[]> {
    return this.driver.createOrUpdate(data)
  }

  /**
   * Update data in database.
   */
  public async update(data: Partial<T>): Promise<T | T[]> {
    return this.driver.update(data)
  }

  /**
   * Delete data in database.
   */
  public async delete(): Promise<T | T[] | void> {
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
  public table(tableName: string): QueryBuilder<T> {
    this.driver.table(tableName)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   */
  public when(
    criteria: any,
    closure: (query: QueryBuilder<T>, criteriaValue: any) => void
  ): QueryBuilder<T> {
    if (criteria) {
      closure(this, criteria)

      return this
    }

    return this
  }

  /**
   * Log in console the actual query built.
   */
  public dump(): QueryBuilder<T> {
    this.driver.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: string[]): QueryBuilder<T> {
    this.driver.select(...columns)

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.selectRaw(sql, bindings)

    return this
  }

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public from(table: string): QueryBuilder<T> {
    this.driver.from(table)

    return this
  }

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public fromRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.fromRaw(sql, bindings)

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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
    this.driver.rightOuterJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a join raw statement in your query.
   */
  public joinRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: string[]): QueryBuilder<T> {
    this.driver.groupBy(...columns)

    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public groupByRaw(sql: string, bindings?: any): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
    this.driver.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   */
  public havingRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   */
  public havingExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.havingExists(closure)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   */
  public havingNotExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.havingNotExists(closure)

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.havingIn(column, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.havingNotIn(column, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.havingBetween(column, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.havingNotBetween(column, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: string): QueryBuilder<T> {
    this.driver.havingNull(column)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: string): QueryBuilder<T> {
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
  ): QueryBuilder<T> {
    this.driver.orHaving(column, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   */
  public orHavingRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   */
  public orHavingExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.orHavingExists(closure)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public orHavingNotExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.orHavingNotExists(closure)

    return this
  }

  /**
   * Set an or having in statement in your query.
   */
  public orHavingIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.orHavingIn(column, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   */
  public orHavingNotIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.orHavingNotIn(column, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   */
  public orHavingBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.orHavingBetween(column, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   */
  public orHavingNotBetween(
    column: string,
    values: [any, any]
  ): QueryBuilder<T> {
    this.driver.orHavingNotBetween(column, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   */
  public orHavingNull(column: string): QueryBuilder<T> {
    this.driver.orHavingNull(column)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   */
  public orHavingNotNull(column: string): QueryBuilder<T> {
    this.driver.orHavingNotNull(column)

    return this
  }

  /**
   * Set a where statement in your query.
   */
  public where(statement: any, operation?: any, value?: any): QueryBuilder<T> {
    this.driver.where(statement, operation, value)

    return this
  }

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any): QueryBuilder<T> {
    this.driver.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   */
  public whereRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   */
  public whereExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.whereExists(closure)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   */
  public whereNotExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.whereNotExists(closure)

    return this
  }

  /**
   * Set a where like statement in your query.
   */
  public whereLike(statement: any, value?: any): QueryBuilder<T> {
    this.driver.whereLike(statement, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(statement: any, value?: any): QueryBuilder<T> {
    this.driver.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.whereIn(column, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.whereNotIn(column, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.whereBetween(column, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.whereNotBetween(column, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: string): QueryBuilder<T> {
    this.driver.whereNull(column)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: string): QueryBuilder<T> {
    this.driver.whereNotNull(column)

    return this
  }

  /**
   * Set a or where statement in your query.
   */
  public orWhere(
    statement: any,
    operation?: any,
    value?: any
  ): QueryBuilder<T> {
    this.driver.orWhere(statement, operation, value)

    return this
  }

  /**
   * Set an or where not statement in your query.
   */
  public orWhereNot(statement: any, value?: any): QueryBuilder<T> {
    this.driver.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   */
  public orWhereRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   */
  public orWhereExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.orWhereExists(closure)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public orWhereNotExists(closure: (query: Driver) => void): QueryBuilder<T> {
    this.driver.orWhereNotExists(closure)

    return this
  }

  /**
   * Set an or where like statement in your query.
   */
  public orWhereLike(statement: any, value?: any): QueryBuilder<T> {
    this.driver.orWhereLike(statement, value)

    return this
  }

  /**
   * Set an or where ILike statement in your query.
   */
  public orWhereILike(statement: any, value?: any): QueryBuilder<T> {
    this.driver.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   */
  public orWhereIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.orWhereIn(column, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public orWhereNotIn(column: string, values: any[]): QueryBuilder<T> {
    this.driver.orWhereNotIn(column, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public orWhereBetween(column: string, values: [any, any]): QueryBuilder<T> {
    this.driver.orWhereBetween(column, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public orWhereNotBetween(
    column: string,
    values: [any, any]
  ): QueryBuilder<T> {
    this.driver.orWhereNotBetween(column, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public orWhereNull(column: string): QueryBuilder<T> {
    this.driver.orWhereNull(column)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public orWhereNotNull(column: string): QueryBuilder<T> {
    this.driver.orWhereNotNull(column)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(
    column: string,
    direction: Direction = 'ASC'
  ): QueryBuilder<T> {
    this.driver.orderBy(column, direction.toUpperCase() as Direction)

    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public orderByRaw(sql: string, bindings?: any): QueryBuilder<T> {
    this.driver.orderByRaw(sql, bindings)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column = 'createdAt'): QueryBuilder<T> {
    this.driver.latest(column)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public oldest(column = 'createdAt'): QueryBuilder<T> {
    this.driver.oldest(column)

    return this
  }

  /**
   * Set the skip number in your query.
   */
  public offset(number: number): QueryBuilder<T> {
    this.driver.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   */
  public limit(number: number): QueryBuilder<T> {
    this.driver.limit(number)

    return this
  }
}
