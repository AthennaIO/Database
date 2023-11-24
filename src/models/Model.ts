/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Collection, String } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'

export class Model {
  /**
   * Set the connection name that model will use
   * to access database.
   */
  public static connection() {
    return Config.get('database.default')
  }

  /**
   * Set the table name of this model instance.
   */
  public static table(): string {
    return String.pluralize(String.toSnakeCase(this.name).toLowerCase())
  }

  /**
   * Set the default values that should be set when creating or
   * updating the model.
   */
  public static attributes(): Record<string, unknown> {
    return {}
  }

  /**
   * Create a new ModelSchema instance from your model.
   */
  public static schema<T extends typeof Model>(this: T) {
    return new ModelSchema<InstanceType<T>>(this)
  }

  /**
   * Create a query builder for the model.
   */
  public static query<T extends typeof Model>(this: T) {
    const driver = Database.connection(this.connection()).driver

    return new ModelQueryBuilder<InstanceType<T>, typeof driver>(this, driver)
  }

  /**
   * Find a value in database.
   */
  public static async find<T extends typeof Model>(
    this: T,
    where?: Partial<InstanceType<T>>
  ): Promise<InstanceType<T>> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.find()
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public static async findOrFail<T extends typeof Model>(
    this: T,
    where?: Partial<InstanceType<T>>
  ): Promise<InstanceType<T>> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.findOrFail()
  }

  /**
   * Return a single data or, if no results are found,
   * execute the given closure.
   */
  public static async findOr<T extends typeof Model>(
    where: Partial<InstanceType<T>>,
    closure: () => any | Promise<any>
  ): Promise<InstanceType<T> | any> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.findOr(closure)
  }

  /**
   * Find many values in database.
   */
  public static async findMany<T extends typeof Model>(
    this: T,
    where?: Partial<InstanceType<T>>
  ): Promise<InstanceType<T>[]> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.findMany()
  }

  /**
   * Find many values in database and return
   * as a collection instance.
   */
  public static async collection<T extends typeof Model>(
    this: T,
    where?: Partial<InstanceType<T>>
  ): Promise<Collection<InstanceType<T>>> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.collection()
  }

  /**
   * Create a value in database.
   */
  public static async create<T extends typeof Model>(
    this: T,
    data: Partial<InstanceType<T>>
  ): Promise<InstanceType<T>> {
    return this.query().create(data)
  }

  /**
   * Create many values in database.
   */
  public static async createMany<T extends typeof Model>(
    this: T,
    data: Partial<InstanceType<T>>[]
  ): Promise<InstanceType<T>[]> {
    return this.query().createMany(data)
  }

  /**
   * Create or update a value in database.
   */
  public static async createOrUpdate<T extends typeof Model>(
    this: T,
    where: Partial<InstanceType<T>>,
    data: Partial<InstanceType<T>>
  ): Promise<InstanceType<T> | InstanceType<T>[]> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.createOrUpdate(data)
  }

  /**
   * Update a value in database.
   */
  public static async update<T extends typeof Model>(
    this: T,
    where: Partial<InstanceType<T>>,
    data: Partial<InstanceType<T>>
  ): Promise<InstanceType<T> | InstanceType<T>[]> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.update(data)
  }

  /**
   * Delete or soft delete a value in database.
   */
  public static async delete<T extends typeof Model>(
    this: T,
    where: Partial<InstanceType<T>>,
    force = false
  ): Promise<void> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.delete(force)
  }
}
