/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  ColumnOptions,
  ModelColumns,
  ModelRelations,
  RelationOptions
} from '#src/types'
import { Database } from '#src/facades/Database'
import { Annotation } from '#src/helpers/Annotation'
import type { BaseModel } from '#src/models/BaseModel'
import { Json, Options, Macroable } from '@athenna/common'
import type { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'
import { NotImplementedRelationException } from '#src/exceptions/NotImplementedRelationException'

export class ModelSchema<M extends BaseModel = any> extends Macroable {
  /**
   * Save the columns defined by @Column annotation.
   */
  public columns: ColumnOptions[]

  /**
   * Save the relations defined by \@HasOne, \@BelongsTo,
   * \@HasMany and \@ManyToMany annotations.
   */
  public relations: RelationOptions[]

  /**
   * The model class that is going to be used
   * to craft the schema.
   */
  private Model: typeof BaseModel

  public constructor(model: any) {
    super()
    this.Model = model
    this.columns = Json.copy(Annotation.getColumnsMeta(model))
    this.relations = Json.copy(Annotation.getRelationsMeta(model))
  }

  /**
   * Sync the database creating migrations
   * or schemas in the database connection.
   */
  public async sync(): Promise<void> {
    await this.getModelDriver().sync(this)
  }

  /**
   * Get the model name set for the schema.
   */
  public getModelName(): string {
    return this.Model.name
  }

  /**
   * Get the model table set for the schema.
   */
  public getModelTable(): string {
    return this.Model.table()
  }

  /**
   * Get the model driver name.
   */
  public getModelDriverName() {
    const connection = this.getModelConnection()

    return Config.get(`database.connections.${connection}.driver`)
  }

  /**
   * Get the model driver.
   */
  public getModelDriver() {
    const connection = this.getModelConnection()

    return Database.connection(connection).driver
  }

  /**
   * Get the model connection name.
   */
  public getModelConnection(): string {
    const connection = this.Model.connection()

    if (connection === 'default') {
      return Config.get('database.default')
    }

    return connection
  }

  /**
   * Get the column options of the main primary key.
   */
  public getMainPrimaryKey(): ColumnOptions {
    let options = this.columns.find(c => c.isMainPrimary)

    if (!options) {
      options = this.columns.find(c => c.name === 'id')

      if (options) {
        if (!options.hasSetName && this.getModelDriverName() === 'mongo') {
          options.name = '_id'
        }
      }
    }

    if (!options) {
      options = this.columns.find(c => c.name === '_id')
    }

    return options
  }

  /**
   * Get the main primary key column name.
   */
  public getMainPrimaryKeyName(): string {
    const options = this.getMainPrimaryKey()

    return options?.name || 'id'
  }

  /**
   * Get the main primary key property.
   */
  public getMainPrimaryKeyProperty(): string {
    const options = this.getMainPrimaryKey()

    return options?.property || 'id'
  }

  /**
   * Convert an object using properties to database use
   * column names.
   */
  public propertiesToColumnNames(
    data: Partial<M> | ModelColumns<M>,
    options: { attributes?: Record<string, any>; cleanPersist?: boolean } = {}
  ) {
    options = Options.create(options, {
      attributes: {},
      cleanPersist: false
    })

    const parsed = {}

    Object.keys(data).forEach(key => {
      const column = this.getColumnByProperty(key) || {
        name: key,
        persist: false
      }

      if (!column.persist && options.cleanPersist) {
        return
      }

      if (data[key] === undefined) {
        return
      }

      parsed[column.name] = data[key]
    })

    Object.keys(options.attributes).forEach(key => {
      const column = this.getColumnByProperty(key) || {
        name: key,
        persist: false
      }

      if (parsed[column.name] !== undefined) {
        return
      }

      parsed[column.name] = options.attributes[key]
    })

    return parsed
  }

  /**
   * Get the column options where column has isCreateDate
   * as true.
   */
  public getCreatedAtColumn(): ColumnOptions {
    return this.columns.find(c => c.isCreateDate)
  }

  /**
   * Get the column options where column has isUpdateDate
   * as true.
   */
  public getUpdatedAtColumn(): ColumnOptions {
    return this.columns.find(c => c.isUpdateDate)
  }

  /**
   * Get the column options where column has isDeleteDate
   * as true.
   */
  public getDeletedAtColumn(): ColumnOptions {
    return this.columns.find(c => c.isDeleteDate)
  }

  /**
   * Get all column properties as an array of string.
   */
  public getAllColumnProperties(): string[] {
    return this.columns.map(column => column.property)
  }

  /**
   * Get all column names as an array of string.
   */
  public getAllColumnNames(): string[] {
    return this.columns.map(column => column.name)
  }

  /**
   * Get all columns where unique option is true.
   */
  public getAllUniqueColumns(): ColumnOptions[] {
    return this.columns.filter(column => column.isUnique)
  }

  /**
   * Get all columns where hidden option is true.
   */
  public getAllHiddenColumns(): ColumnOptions[] {
    return this.columns.filter(column => column.isHidden)
  }

  /**
   * Get all columns where nullable option is false.
   */
  public getAllNotNullableColumns(): ColumnOptions[] {
    return this.columns.filter(column => !column.isNullable)
  }

  /**
   * Validate that model has createdAt and updatedAt
   * column defined.
   */
  public hasTimestamps(): boolean {
    return !!this.getCreatedAtColumn() && !!this.getUpdatedAtColumn()
  }

  /**
   * Get the column options by the column database name.
   */
  public getColumnByName(column: string | ModelColumns<M>): ColumnOptions {
    return this.columns.find(c => c.name === column)
  }

  /**
   * Get the column options by the column database name.
   *
   * If property cannot be found, the column name will be used.
   */
  public getPropertyByColumnName(column: string | ModelColumns<M>): string {
    return this.getColumnByName(column)?.property || (column as string)
  }

  /**
   * Get all the properties names by an array of column database names.
   *
   * If property cannot be found, the column name will be used.
   */
  public getPropertiesByColumnNames(
    columns: string[] | ModelColumns<M>[]
  ): string[] {
    return columns.map(column => this.getPropertyByColumnName(column))
  }

  /**
   * Get the column options by the model class property.
   */
  public getColumnByProperty(
    property: string | ModelColumns<M>
  ): ColumnOptions {
    return this.columns.find(c => c.property === property)
  }

  /**
   * Get the column name by the model class property.
   *
   * If the column name cannot be found, the property will be used.
   */
  public getColumnNameByProperty(property: string | ModelColumns<M>): string {
    return this.getColumnByProperty(property)?.name || (property as string)
  }

  /**
   * Get all the columns names by an array of model class properties.
   *
   * If the column name cannot be found, the property will be used.
   */
  public getColumnNamesByProperties(
    properties: string[] | ModelColumns<M>[]
  ): string[] {
    return properties.map(property => this.getColumnNameByProperty(property))
  }

  /**
   * Get the relation by the class property name.
   */
  public getRelationByProperty(property: string | ModelColumns<M>) {
    return this.relations.find(c => c.property === property)
  }

  /**
   * Return the relation options only from relations
   * that are included.
   */
  public getIncludedRelations(): RelationOptions[] {
    return this.relations.filter(r => r.isIncluded || r.isWhereHasIncluded)
  }

  /**
   * Return the relation properties.
   */
  public getRelationProperties(): string[] {
    return this.relations.map(r => r.property)
  }

  /**
   * Include a relation by setting the isIncluded
   * option to true.
   */
  public includeRelation(
    property: string | ModelRelations<M>,
    closure?: (query: ModelQueryBuilder) => any
  ) {
    const model = this.Model.name

    if (property.includes('.')) {
      const [first, ...rest] = property.split('.')

      property = first
      closure = this.createdNestedRelationClosure(rest)
    }

    const options = this.getRelationByProperty(property)

    if (!options) {
      throw new NotImplementedRelationException(
        property as string,
        model,
        this.relations.map(r => r.property).join(', ')
      )
    }

    const i = this.relations.indexOf(options)

    options.isIncluded = true
    options.closure = closure

    this.relations[i] = options

    return options
  }

  /**
   * Include a relation by setting the isWhereHasIncluded
   * option to true.
   */
  public includeWhereHasRelation(
    property: string | ModelRelations<M>,
    closure?: (query: ModelQueryBuilder) => any
  ) {
    const model = this.Model.name

    if (property.includes('.')) {
      const [first, ...rest] = property.split('.')

      property = first
      closure = this.createdNestedRelationClosure(rest)
    }

    const options = this.getRelationByProperty(property)

    if (!options) {
      throw new NotImplementedRelationException(
        property as string,
        model,
        this.relations.map(r => r.property).join(', ')
      )
    }

    const i = this.relations.indexOf(options)

    options.isWhereHasIncluded = true
    options.closure = closure

    this.relations[i] = options

    return options
  }

  /**
   * Created nested relationships closure to
   * load relationship's relationships
   */
  private createdNestedRelationClosure(relationships: string[]) {
    if (relationships.length === 1) {
      return (query: any) => query.with(relationships[0])
    }

    const [first, ...rest] = relationships
    const closure = this.createdNestedRelationClosure(rest)

    return (query: any) => query.with(first, closure)
  }
}
