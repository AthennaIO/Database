/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Collection,
  Is,
  Json,
  Options,
  String,
  type PaginatedResponse,
  type PaginationOptions
} from '@athenna/common'

import equal from 'fast-deep-equal'
import { Database } from '#src/facades/Database'
import type { ModelRelations } from '#src/types'
import { faker, type Faker } from '@faker-js/faker'
import { ModelSchema } from '#src/models/schemas/ModelSchema'
import { ModelFactory } from '#src/models/factories/ModelFactory'
import { ModelGenerator } from '#src/models/factories/ModelGenerator'
import { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'

export class BaseModel {
  /**
   * Set if the `attributes` method should be called or not.
   */
  private static get isToSetAttributes() {
    return Config.get(
      `database.connections.${this.connection()}.validations.isToSetAttributes`,
      true
    )
  }

  /**
   * Set if the option annotation `isUnique`
   * should be verified or not.
   */
  private static get isToValidateUnique() {
    return Config.get(
      `database.connections.${this.connection()}.validations.isToValidateUnique`,
      true
    )
  }

  /**
   * Set if the option annotation `isNullable`
   * should be verified or not.
   */
  private static get isToValidateNullable() {
    return Config.get(
      `database.connections.${this.connection()}.validations.isToValidateNullable`,
      true
    )
  }

  /**
   * The faker instance to create fake data in
   * definition instance.
   */
  public static get faker(): Faker {
    return faker
  }

  /**
   * Set the connection name that model will use
   * to access database.
   */
  public static connection() {
    return Config.get('database.default')
  }

  /**
   * Set if model should automatically be sync with
   * database when running DatabaseProvider.
   *
   * @default true
   */
  public static sync(): boolean {
    const connection = this.connection()
    const driver = Config.get(`database.connections.${connection}.driver`)

    if (driver === 'mongo') {
      return true
    }

    return false
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
  public static schema<T extends typeof BaseModel>(this: T) {
    return new ModelSchema<InstanceType<T>>(this)
  }

  /**
   * Create a new ModelFactory instance from your model.
   */
  public static factory<T extends typeof BaseModel>(this: T) {
    return new ModelFactory<InstanceType<T>>(this)
  }

  /**
   * Enable/disable setting the default attributes properties
   * when creating/updating models.
   */
  public static setAttributes<T extends typeof BaseModel>(
    this: T,
    value: boolean
  ) {
    Config.set(
      `database.connections.${this.connection()}.validations.isToSetAttributes`,
      value
    )

    return this
  }

  /**
   * Enable/disable the `isUnique` property validation of
   * models columns.
   */
  public static uniqueValidation<T extends typeof BaseModel>(
    this: T,
    value: boolean
  ) {
    Config.set(
      `database.connections.${this.connection()}.validations.isToValidateUnique`,
      value
    )

    return this
  }

  /**
   * Enable/disable the `isNullable` property validation of
   * models columns.
   */
  public static nullableValidation<T extends typeof BaseModel>(
    this: T,
    value: boolean
  ) {
    Config.set(
      `database.connections.${this.connection()}.validations.isToValidateNullable`,
      value
    )

    return this
  }

  /**
   * Create a query builder for the model.
   */
  public static query<T extends typeof BaseModel>(this: T) {
    const driver = Database.connection(this.connection()).driver

    return new ModelQueryBuilder<InstanceType<T>, typeof driver>(this, driver)
      .setAttributes(this.isToSetAttributes)
      .uniqueValidation(this.isToValidateUnique)
      .nullableValidation(this.isToValidateNullable)
  }

  /**
   * Remove all data inside model table
   * and restart the identity of the table.
   */
  public static async truncate(): Promise<void> {
    await Database.connection(this.connection()).truncate(this.table())
  }

  /**
   * Find a value in database.
   */
  public static async find<T extends typeof BaseModel>(
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
   * Find a value in database.
   */
  public static async exists<T extends typeof BaseModel>(
    this: T,
    where?: Partial<InstanceType<T>>
  ): Promise<boolean> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.exists()
  }

  /**
   * Find a value in database or throw exception if undefined.
   */
  public static async findOrFail<T extends typeof BaseModel>(
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
  public static async findOr<T extends typeof BaseModel>(
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
  public static async findMany<T extends typeof BaseModel>(
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
   * Find many values in database and return paginated.
   */
  public static async paginate<T extends typeof BaseModel>(
    this: T,
    options?: PaginationOptions,
    where?: Partial<InstanceType<T>>
  ): Promise<PaginatedResponse<InstanceType<T>>> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.paginate(options)
  }

  /**
   * Find many values in database and return
   * as a collection instance.
   */
  public static async collection<T extends typeof BaseModel>(
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
  public static async create<T extends typeof BaseModel>(
    this: T,
    data: Partial<InstanceType<T>> = {},
    cleanPersist = true
  ): Promise<InstanceType<T>> {
    return this.query().create(data, cleanPersist)
  }

  /**
   * Create many values in database.
   */
  public static async createMany<T extends typeof BaseModel>(
    this: T,
    data: Partial<InstanceType<T>>[],
    cleanPersist = true
  ): Promise<InstanceType<T>[]> {
    return this.query().createMany(data, cleanPersist)
  }

  /**
   * Create or update a value in database.
   */
  public static async createOrUpdate<T extends typeof BaseModel>(
    this: T,
    where: Partial<InstanceType<T>>,
    data: Partial<InstanceType<T>>,
    cleanPersist = true
  ): Promise<InstanceType<T> | InstanceType<T>[]> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.createOrUpdate(data, cleanPersist)
  }

  /**
   * Update a value in database.
   */
  public static async update<T extends typeof BaseModel>(
    this: T,
    where: Partial<InstanceType<T>>,
    data: Partial<InstanceType<T>>,
    cleanPersist = true
  ): Promise<InstanceType<T> | InstanceType<T>[]> {
    const query = this.query()

    if (where) {
      query.where(where)
    }

    return query.update(data, cleanPersist)
  }

  /**
   * Delete or soft delete a value in database.
   */
  public static async delete<T extends typeof BaseModel>(
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
   * The original model values when it was fetched
   * from database. If is undefined, means that model
   * is a fresh instance and is not available in database
   * yet.
   */
  private original?: Record<string, any>

  /**
   * Set the original model values by deep copying
   * the model state.
   */
  public setOriginal() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.original = {}

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Object.keys(Json.copy(Json.omit(this, ['original']))).forEach(key => {
      const value = this[key]

      if (Is.Array(value) && value[0]?.original) {
        return
      }

      if (value && value.original) {
        return
      }

      this.original[key] = value
    })

    return this
  }

  /**
   * Return a Json object from the actual subclass instance.
   */
  public toJSON(options?: { withHidden?: boolean }): Record<string, any> {
    options = Options.create(options, {
      withHidden: false
    })

    const _Model = this.constructor as unknown as typeof BaseModel

    const json = {}
    const relations = _Model.schema().getRelationProperties()

    /**
     * Execute the toJSON of relations.
     */
    Object.keys(this).forEach(key => {
      if (key === 'original') {
        return
      }

      if (relations.includes(key)) {
        if (Is.Array(this[key])) {
          json[key] = this[key].map(d => (d.toJSON ? d.toJSON() : d))

          return
        }

        json[key] = this[key].toJSON ? this[key].toJSON() : this[key]

        return
      }

      if (
        !options.withHidden &&
        _Model.schema().getColumnByProperty(key)?.isHidden
      ) {
        return
      }

      json[key] = this[key]
    })

    return json
  }

  public load(relation: string): Promise<any>
  public load<K extends ModelRelations<this>>(
    relation: K,
    closure?: (
      query: ModelQueryBuilder<
        Extract<this[K] extends BaseModel[] ? this[K][0] : this[K], BaseModel>
      >
    ) => any
  ): Promise<this[K]>

  /**
   * Eager load a model relation from model instance.
   */
  public async load<K extends ModelRelations<this>>(
    relation: K | string,
    closure?: (
      query: ModelQueryBuilder<
        Extract<this[K] extends BaseModel[] ? this[K][0] : this[K], BaseModel>
      >
    ) => any
  ) {
    const Model = this.constructor as any
    const schema = Model.schema()
    const generator = new ModelGenerator(Model, schema)

    await generator.includeRelation(
      this,
      schema.includeRelation(relation, closure)
    )

    if (relation.includes('.')) {
      return Json.get(this, relation)
    }

    return this[relation as any]
  }

  /**
   * Validate if model is persisted in database
   * or if it's a fresh instance.
   */
  public isPersisted(): boolean {
    return !!this.original
  }

  /**
   * Get values only that are different from
   * the original property to avoid updating
   * data that was not changed.
   */
  public dirty() {
    if (!this.isPersisted()) {
      return this
    }

    const dirty: Record<string, any> = {}

    Object.keys(this).forEach(key => {
      if (key === 'original') {
        return
      }

      if (equal(this.original[key], this[key])) {
        return
      }

      dirty[key] = Json.copy(this[key])
    })

    return dirty
  }

  /**
   * Validate if model has been changed from
   * it initial state when it was retrieved from
   * database.
   */
  public isDirty(): boolean {
    return Object.keys(this.dirty()).length > 0
  }

  /**
   * Save the changes done in the model in database.
   */
  public async save(cleanPersist = true) {
    const Model = this.constructor as any
    const schema = Model.schema()
    const primaryKey = schema.getMainPrimaryKeyProperty()
    const date = new Date()
    const createdAt = schema.getCreatedAtColumn()
    const updatedAt = schema.getUpdatedAtColumn()
    const deletedAt = schema.getDeletedAtColumn()
    const attributes = Model.isToSetAttributes ? Model.attributes() : {}

    Object.keys(attributes).forEach(key => {
      if (this[key]) {
        return
      }

      this[key] = attributes[key]
    })

    if (createdAt && this[createdAt.property] === undefined) {
      this[createdAt.property] = date
    }

    if (updatedAt && this[updatedAt.property] === undefined) {
      this[updatedAt.property] = date
    }

    if (deletedAt && this[deletedAt.property] === undefined) {
      this[deletedAt.property] = null
    }

    const data = this.dirty()

    if (!this.isPersisted()) {
      const created = await Model.create(data, cleanPersist)

      Object.keys(created).forEach(key => (this[key] = created[key]))

      return this.setOriginal()
    }

    /**
     * Means data is not dirty because there are any
     * value that is different from original prop.
     */
    if (!Object.keys(data).length) {
      return this
    }

    const where = { [primaryKey]: this[primaryKey] }
    const updated = await Model.update(where, data, cleanPersist)

    Object.keys(updated).forEach(key => (this[key] = updated[key]))

    return this.setOriginal()
  }

  /**
   * Create a new instance of the model from retrieving
   * again the data from database. The existing
   * model instance WILL NOT BE affected.
   */
  public async fresh() {
    const Model = this.constructor as any
    const primaryKey = Model.schema().getMainPrimaryKeyProperty()

    return Model.query()
      .where(primaryKey, this[primaryKey])
      .withTrashed()
      .find()
  }

  /**
   * Refresh the model instance data retrieving
   * model data using the main primary key. The
   * existing model instance WILL BE affected.
   */
  public async refresh() {
    const Model = this.constructor as any
    const schema = Model.schema()
    const relations = schema.getRelationProperties()
    const primaryKey = schema.getMainPrimaryKeyProperty()
    const query = Model.query()
      .where(primaryKey, this[primaryKey])
      .withTrashed()

    Object.keys(this).forEach(key => {
      if (!relations.includes(key)) {
        return
      }

      query.with(key)
    })

    const data = await query.find()

    Object.keys(data).forEach(key => (this[key] = data[key]))
  }

  /**
   * Verify if model is soft deleted.
   */
  public isTrashed(): boolean {
    const Model = this.constructor as any
    const deletedAt = Model.schema().getDeletedAtColumn()

    return !!this[deletedAt.property]
  }

  /**
   * Delete or soft delete your model from database.
   */
  public async delete(force = false) {
    const Model = this.constructor as any
    const primaryKey = Model.schema().getMainPrimaryKeyProperty()

    await Model.query().where(primaryKey, this[primaryKey]).delete(force)
  }

  /**
   * Restore a soft deleted model from database.
   */
  public async restore() {
    const Model = this.constructor as any
    const primaryKey = Model.schema().getMainPrimaryKeyProperty()

    const restored = await Model.query()
      .where(primaryKey, this[primaryKey])
      .restore()

    Object.keys(restored).forEach(key => (this[key] = restored[key]))

    return this
  }
}
