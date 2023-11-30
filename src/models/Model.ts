/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Database } from '#src/facades/Database'
import { Collection, Is, String } from '@athenna/common'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelFactory } from '#src/models/factories/ModelFactory'
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
   * Set the definition data that will be used when fabricating
   * instances of your model using factories.
   */
  public static async definition(): Promise<Record<string, unknown>> {
    return {}
  }

  /**
   * Create a new ModelSchema instance from your model.
   */
  public static schema<T extends typeof Model>(this: T) {
    return new ModelSchema<InstanceType<T>>(this)
  }

  /**
   * Create a new ModelFactory instance from your model.
   */
  public static factory<T extends typeof Model>(this: T) {
    return new ModelFactory<InstanceType<T>>(this)
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
    this: T,
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

  /**
   * The pivot data from many to many relations.
   */
  public pivot?: Record<string, any>

  /**
   * Return a Json object from the actual subclass instance.
   */
  public toJSON(): Record<string, any> {
    const _Model = this.constructor as unknown as typeof Model

    const json = {}
    const relations = _Model.schema().getRelationProperties()

    /**
     * Execute the toJSON of relations.
     */
    Object.keys(this).forEach(key => {
      if (relations.includes(key)) {
        if (Is.Array(this[key])) {
          json[key] = this[key].map(d => (d.toJSON ? d.toJSON() : d))

          return
        }

        json[key] = this[key].toJSON ? this[key].toJSON() : this[key]

        return
      }

      json[key] = this[key]
    })

    return json
  }
}
