/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Direction } from '#src/types'
import type { Operations } from '#src/types/Operations'
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
   * Set the driver primary key that will be used
   * when creating new data.
   */
  public setPrimaryKey(primaryKey: string): this {
    this.driver.setPrimaryKey(primaryKey)

    return this
  }

  /**
   * Calculate the average of a given column.
   */
  public async avg(column: string | keyof T): Promise<string> {
    return this.driver.avg(column as string)
  }

  /**
   * Calculate the average of a given column.
   */
  public async avgDistinct(column: string | keyof T): Promise<string> {
    return this.driver.avgDistinct(column as string)
  }

  /**
   * Get the max number of a given column.
   */
  public async max(column: string | keyof T): Promise<string> {
    return this.driver.max(column as string)
  }

  /**
   * Get the min number of a given column.
   */
  public async min(column: string | keyof T): Promise<string> {
    return this.driver.min(column as string)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sum(column: string | keyof T): Promise<string> {
    return this.driver.sum(column as string)
  }

  /**
   * Sum all numbers of a given column.
   */
  public async sumDistinct(column: string | keyof T): Promise<string> {
    return this.driver.sumDistinct(column as string)
  }

  /**
   * Increment a value of a given column.
   */
  public async increment(column: string | keyof T): Promise<void> {
    await this.driver.increment(column as string)
  }

  /**
   * Decrement a value of a given column.
   */
  public async decrement(column: string | keyof T): Promise<void> {
    await this.driver.decrement(column as string)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async count(column: string | keyof T = '*'): Promise<string> {
    return this.driver.count(column as string)
  }

  /**
   * Calculate the average of a given column using distinct.
   */
  public async countDistinct(column: string | keyof T): Promise<string> {
    return this.driver.countDistinct(column as string)
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public async findOrFail(): Promise<T> {
    return this.driver.findOrFail()
  }

  /**
   * Return a single data or, if no results are found,
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
  public table(tableName: string): this {
    this.driver.table(tableName)

    return this
  }

  /**
   * Executes the given closure when the first argument is true.
   */
  public when(
    criteria: any,
    closure: (query: this, criteriaValue: any) => void
  ): this {
    if (criteria) {
      closure(this, criteria)

      return this
    }

    return this
  }

  /**
   * Log in console the actual query built.
   */
  public dump(): this {
    this.driver.dump()

    return this
  }

  /**
   * Set the columns that should be selected on query.
   */
  public select(...columns: string[] | Array<keyof T>): this {
    this.driver.select(...(columns as string[]))

    return this
  }

  /**
   * Set the columns that should be selected on query raw.
   */
  public selectRaw(sql: string, bindings?: any): this {
    this.driver.selectRaw(sql, bindings)

    return this
  }

  /**
   * Set the table that should be used on query.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public from(table: string): this {
    this.driver.from(table)

    return this
  }

  /**
   * Set the table that should be used on query raw.
   * Different from `table()` method, this method
   * doesn't change the driver table.
   */
  public fromRaw(sql: string, bindings?: any): this {
    this.driver.fromRaw(sql, bindings)

    return this
  }

  public join(tableName: string): this
  public join(tableName: string, column: string): this
  public join(tableName: string, column1: string, column2: string): this
  public join(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a join statement in your query.
   */
  public join(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.join(tableName, column1, operation, column2)

    return this
  }

  public leftJoin(tableName: string): this
  public leftJoin(tableName: string, column: string): this
  public leftJoin(tableName: string, column1: string, column2: string): this
  public leftJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a left join statement in your query.
   */
  public leftJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.leftJoin(tableName, column1, operation, column2)

    return this
  }

  public rightJoin(tableName: string): this
  public rightJoin(tableName: string, column: string): this
  public rightJoin(tableName: string, column1: string, column2: string): this
  public rightJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a right join statement in your query.
   */
  public rightJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.rightJoin(tableName, column1, operation, column2)

    return this
  }

  public crossJoin(tableName: string): this
  public crossJoin(tableName: string, column: string): this
  public crossJoin(tableName: string, column1: string, column2: string): this
  public crossJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a cross join statement in your query.
   */
  public crossJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.crossJoin(tableName, column1, operation, column2)

    return this
  }

  public fullOuterJoin(tableName: string): this
  public fullOuterJoin(tableName: string, column: string): this
  public fullOuterJoin(
    tableName: string,
    column1: string,
    column2: string
  ): this

  public fullOuterJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a full outer join statement in your query.
   */
  public fullOuterJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.fullOuterJoin(tableName, column1, operation, column2)

    return this
  }

  public leftOuterJoin(tableName: string): this
  public leftOuterJoin(tableName: string, column: string): this
  public leftOuterJoin(
    tableName: string,
    column1: string,
    column2: string
  ): this

  public leftOuterJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a left outer join statement in your query.
   */
  public leftOuterJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.leftOuterJoin(tableName, column1, operation, column2)

    return this
  }

  public rightOuterJoin(tableName: string): this
  public rightOuterJoin(tableName: string, column: string): this
  public rightOuterJoin(
    tableName: string,
    column1: string,
    column2: string
  ): this

  public rightOuterJoin(
    tableName: string,
    column1: string,
    operation: Operations,
    column2: string
  ): this

  /**
   * Set a right outer join statement in your query.
   */
  public rightOuterJoin(
    tableName: string,
    column1?: string,
    operation?: string | Operations,
    column2?: string
  ): this {
    this.driver.rightOuterJoin(tableName, column1, operation, column2)

    return this
  }

  /**
   * Set a join raw statement in your query.
   */
  public joinRaw(sql: string, bindings?: any): this {
    this.driver.joinRaw(sql, bindings)

    return this
  }

  /**
   * Set a group by statement in your query.
   */
  public groupBy(...columns: string[] | Array<keyof T>): this {
    this.driver.groupBy(...(columns as string[]))

    return this
  }

  /**
   * Set a group by raw statement in your query.
   */
  public groupByRaw(sql: string, bindings?: any): this {
    this.driver.groupByRaw(sql, bindings)

    return this
  }

  /**
   * Set a having statement in your query.
   */
  public having(
    column: string | keyof T,
    operation?: any | Operations,
    value?: any
  ): this {
    this.driver.having(column, operation, value)

    return this
  }

  /**
   * Set a having raw statement in your query.
   */
  public havingRaw(sql: string, bindings?: any): this {
    this.driver.havingRaw(sql, bindings)

    return this
  }

  /**
   * Set a having exists statement in your query.
   */
  public havingExists(closure: (query: Driver) => void): this {
    this.driver.havingExists(closure)

    return this
  }

  /**
   * Set a having not exists statement in your query.
   */
  public havingNotExists(closure: (query: Driver) => void): this {
    this.driver.havingNotExists(closure)

    return this
  }

  /**
   * Set a having in statement in your query.
   */
  public havingIn(column: string | keyof T, values: any[]): this {
    this.driver.havingIn(column as string, values)

    return this
  }

  /**
   * Set a having not in statement in your query.
   */
  public havingNotIn(column: string | keyof T, values: any[]): this {
    this.driver.havingNotIn(column as string, values)

    return this
  }

  /**
   * Set a having between statement in your query.
   */
  public havingBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.havingBetween(column as string, values)

    return this
  }

  /**
   * Set a having not between statement in your query.
   */
  public havingNotBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.havingNotBetween(column as string, values)

    return this
  }

  /**
   * Set a having null statement in your query.
   */
  public havingNull(column: string | keyof T): this {
    this.driver.havingNull(column as string)

    return this
  }

  /**
   * Set a having not null statement in your query.
   */
  public havingNotNull(column: string | keyof T): this {
    this.driver.havingNotNull(column as string)

    return this
  }

  /**
   * Set an or having statement in your query.
   */
  public orHaving(
    column: string | keyof T,
    operation?: any | Operations,
    value?: any
  ): this {
    this.driver.orHaving(column as string, operation, value)

    return this
  }

  /**
   * Set an or having raw statement in your query.
   */
  public orHavingRaw(sql: string, bindings?: any): this {
    this.driver.orHavingRaw(sql, bindings)

    return this
  }

  /**
   * Set an or having exists statement in your query.
   */
  public orHavingExists(closure: (query: Driver) => void): this {
    this.driver.orHavingExists(closure)

    return this
  }

  /**
   * Set an or having not exists statement in your query.
   */
  public orHavingNotExists(closure: (query: Driver) => void): this {
    this.driver.orHavingNotExists(closure)

    return this
  }

  /**
   * Set an or having in statement in your query.
   */
  public orHavingIn(column: string | keyof T, values: any[]): this {
    this.driver.orHavingIn(column as string, values)

    return this
  }

  /**
   * Set an or having not in statement in your query.
   */
  public orHavingNotIn(column: string | keyof T, values: any[]): this {
    this.driver.orHavingNotIn(column as string, values)

    return this
  }

  /**
   * Set an or having between statement in your query.
   */
  public orHavingBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.orHavingBetween(column as string, values)

    return this
  }

  /**
   * Set an or having not between statement in your query.
   */
  public orHavingNotBetween(
    column: string | keyof T,
    values: [any, any]
  ): this {
    this.driver.orHavingNotBetween(column as string, values)

    return this
  }

  /**
   * Set an or having null statement in your query.
   */
  public orHavingNull(column: string | keyof T): this {
    this.driver.orHavingNull(column as string)

    return this
  }

  /**
   * Set an or having not null statement in your query.
   */
  public orHavingNotNull(column: string | keyof T): this {
    this.driver.orHavingNotNull(column as string)

    return this
  }

  public where(statement: Partial<T>): this
  public where(statement: Record<string, any>): this
  public where(key: string | keyof T, value: any): this
  public where(key: string | keyof T, operation: Operations, value: any): this

  /**
   * Set a where statement in your query.
   */
  public where(
    statement: any,
    operation?: any | Operations,
    value?: any
  ): this {
    this.driver.where(statement, operation, value)

    return this
  }

  public whereNot(statement: Partial<T>): this
  public whereNot(statement: Record<string, any>): this
  public whereNot(key: string | keyof T, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public whereNot(statement: any, value?: any): this {
    this.driver.whereNot(statement, value)

    return this
  }

  /**
   * Set a where raw statement in your query.
   */
  public whereRaw(sql: string, bindings?: any): this {
    this.driver.whereRaw(sql, bindings)

    return this
  }

  /**
   * Set a where exists statement in your query.
   */
  public whereExists(closure: (query: Driver) => void): this {
    this.driver.whereExists(closure)

    return this
  }

  /**
   * Set a where not exists statement in your query.
   */
  public whereNotExists(closure: (query: Driver) => void): this {
    this.driver.whereNotExists(closure)

    return this
  }

  public whereLike(statement: Partial<T>): this
  public whereLike(statement: Record<string, any>): this
  public whereLike(key: string | keyof T, value: any): this

  /**
   * Set a where like statement in your query.
   */
  public whereLike(statement: any, value?: any): this {
    this.driver.whereLike(statement, value)

    return this
  }

  public whereILike(statement: Partial<T>): this
  public whereILike(statement: Record<string, any>): this
  public whereILike(key: string | keyof T, value: any): this

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(statement: any, value?: any): this {
    this.driver.whereILike(statement, value)

    return this
  }

  /**
   * Set a where in statement in your query.
   */
  public whereIn(column: string | keyof T, values: any[]): this {
    this.driver.whereIn(column as string, values)

    return this
  }

  /**
   * Set a where not in statement in your query.
   */
  public whereNotIn(column: string | keyof T, values: any[]): this {
    this.driver.whereNotIn(column as string, values)

    return this
  }

  /**
   * Set a where between statement in your query.
   */
  public whereBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.whereBetween(column as string, values)

    return this
  }

  /**
   * Set a where not between statement in your query.
   */
  public whereNotBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.whereNotBetween(column as string, values)

    return this
  }

  /**
   * Set a where null statement in your query.
   */
  public whereNull(column: string | keyof T): this {
    this.driver.whereNull(column as string)

    return this
  }

  /**
   * Set a where not null statement in your query.
   */
  public whereNotNull(column: string | keyof T): this {
    this.driver.whereNotNull(column as string)

    return this
  }

  public orWhere(statement: Partial<T>): this
  public orWhere(statement: Record<string, any>): this
  public orWhere(key: string | keyof T, value: any): this
  public orWhere(key: string | keyof T, operation: Operations, value: any): this

  /**
   * Set a or where statement in your query.
   */
  public orWhere(
    statement: any,
    operation?: any | Operations,
    value?: any
  ): this {
    this.driver.orWhere(statement, operation, value)

    return this
  }

  public orWhereNot(statement: Partial<T>): this
  public orWhereNot(statement: Record<string, any>): this
  public orWhereNot(key: string | keyof T, value: any): this

  /**
   * Set a where not statement in your query.
   */
  public orWhereNot(statement: any, value?: any): this {
    this.driver.orWhereNot(statement, value)

    return this
  }

  /**
   * Set a or where raw statement in your query.
   */
  public orWhereRaw(sql: string, bindings?: any): this {
    this.driver.orWhereRaw(sql, bindings)

    return this
  }

  /**
   * Set an or where exists statement in your query.
   */
  public orWhereExists(closure: (query: Driver) => void): this {
    this.driver.orWhereExists(closure)

    return this
  }

  /**
   * Set an or where not exists statement in your query.
   */
  public orWhereNotExists(closure: (query: Driver) => void): this {
    this.driver.orWhereNotExists(closure)

    return this
  }

  public orWhereLike(statement: Partial<T>): this
  public orWhereLike(statement: Record<string, any>): this
  public orWhereLike(key: string | keyof T, value: any): this

  /**
   * Set an or where like statement in your query.
   */
  public orWhereLike(statement: any, value?: any): this {
    this.driver.orWhereLike(statement, value)

    return this
  }

  public orWhereILike(statement: Partial<T>): this
  public orWhereILike(statement: Record<string, any>): this
  public orWhereILike(key: string | keyof T, value: any): this

  /**
   * Set an or where ILike statement in your query.
   */
  public orWhereILike(statement: any, value?: any): this {
    this.driver.orWhereILike(statement, value)

    return this
  }

  /**
   * Set an or where in statement in your query.
   */
  public orWhereIn(column: string | keyof T, values: any[]): this {
    this.driver.orWhereIn(column as string, values)

    return this
  }

  /**
   * Set an or where not in statement in your query.
   */
  public orWhereNotIn(column: string | keyof T, values: any[]): this {
    this.driver.orWhereNotIn(column as string, values)

    return this
  }

  /**
   * Set an or where between statement in your query.
   */
  public orWhereBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.orWhereBetween(column as string, values)

    return this
  }

  /**
   * Set an or where not between statement in your query.
   */
  public orWhereNotBetween(column: string | keyof T, values: [any, any]): this {
    this.driver.orWhereNotBetween(column as string, values)

    return this
  }

  /**
   * Set an or where null statement in your query.
   */
  public orWhereNull(column: string | keyof T): this {
    this.driver.orWhereNull(column as string)

    return this
  }

  /**
   * Set an or where not null statement in your query.
   */
  public orWhereNotNull(column: string | keyof T): this {
    this.driver.orWhereNotNull(column as string)

    return this
  }

  /**
   * Set an order by statement in your query.
   */
  public orderBy(column: string | keyof T, direction: Direction = 'ASC'): this {
    this.driver.orderBy(column as string, direction.toUpperCase() as Direction)

    return this
  }

  /**
   * Set an order by raw statement in your query.
   */
  public orderByRaw(sql: string, bindings?: any): this {
    this.driver.orderByRaw(sql, bindings)

    return this
  }

  /**
   * Order the results easily by the latest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public latest(column: string | keyof T = 'createdAt'): this {
    this.driver.latest(column as string)

    return this
  }

  /**
   * Order the results easily by the oldest date. By default, the result will
   * be ordered by the table's "createdAt" column.
   */
  public oldest(column: string | keyof T = 'createdAt'): this {
    this.driver.oldest(column as string)

    return this
  }

  /**
   * Set the skip number in your query.
   */
  public offset(number: number): this {
    this.driver.offset(number)

    return this
  }

  /**
   * Set the limit number in your query.
   */
  public limit(number: number): this {
    this.driver.limit(number)

    return this
  }
}
