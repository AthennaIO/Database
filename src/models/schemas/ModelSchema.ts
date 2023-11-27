/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Options } from '@athenna/common'
import type { Model } from '#src/models/Model'
import { Annotation } from '#src/helpers/Annotation'
import type { ColumnOptions, RelationOptions } from '#src/types'
import type { ModelQueryBuilder } from '#src/models/builders/ModelQueryBuilder'
import { NotImplementedRelationException } from '#src/exceptions/NotImplementedRelationException'

export class ModelSchema<M extends Model = any> {
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
  private Model: typeof Model

  public constructor(model: any) {
    this.Model = model
    this.columns = Annotation.getColumnsMeta(model)
    this.relations = Annotation.getRelationsMeta(model)
  }

  /**
   * Get the column options of the main primary key.
   */
  public getMainPrimaryKey(): ColumnOptions {
    let options = this.columns.find(c => c.isMainPrimary)

    if (!options) {
      options = this.columns.find(c => c.name === 'id')
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

    // TODO Validate if need to verify if using mongo
    return options?.name || 'id'
  }

  /**
   * Get the main primary key property.
   */
  public getMainPrimaryKeyProperty(): string {
    const options = this.getMainPrimaryKey()

    // TODO Validate if need to verify if using mongo
    return options?.property || 'id'
  }

  /**
   * Convert an object using properties to database use
   * column names.
   */
  public propertiesToColumnNames(
    data: Partial<M>,
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
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.isCreateDate)
  }

  /**
   * Get the column options where column has isUpdateDate
   * as true.
   */
  public getUpdatedAtColumn(): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.isUpdateDate)
  }

  /**
   * Get the column options where column has isDeleteDate
   * as true.
   */
  public getDeletedAtColumn(): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.isDeleteDate)
  }

  /**
   * Get the column options by the column database name.
   */
  public getColumnByName(column: string | keyof M): ColumnOptions {
    const columns = Annotation.getColumnsMeta(this.Model)

    return columns.find(c => c.name === column)
  }

  /**
   * Get the column options by the column database name.
   *
   * If property cannot be found, the column name will be used.
   */
  public getPropertyByColumnName(column: string | keyof M): string {
    return this.getColumnByName(column)?.property || (column as string)
  }

  /**
   * Get all the properties names by an array of column database names.
   *
   * If property cannot be found, the column name will be used.
   */
  public getPropertiesByColumnNames(
    columns: string[] | Array<keyof M>
  ): string[] {
    return columns.map(column => this.getPropertyByColumnName(column))
  }

  /**
   * Get the column options by the model class property.
   */
  public getColumnByProperty(property: string | keyof M): ColumnOptions {
    return this.columns.find(c => c.property === property)
  }

  /**
   * Get the column name by the model class property.
   *
   * If the column name cannot be found, the property will be used.
   */
  public getColumnNameByProperty(property: string | keyof M): string {
    return this.getColumnByProperty(property)?.name || (property as string)
  }

  /**
   * Get all the columns names by an array of model class properties.
   *
   * If the column name cannot be found, the property will be used.
   */
  public getColumnNamesByProperties(
    properties: string[] | Array<keyof M>
  ): string[] {
    return properties.map(property => this.getColumnNameByProperty(property))
  }

  /**
   * Get the relation by the class property name.
   */
  public getRelationByProperty(property: string | keyof M) {
    return this.relations.find(c => c.property === property)
  }

  /**
   * Return the relation options only from relations
   * that are included.
   */
  public getIncludedRelations(): RelationOptions[] {
    return this.relations.filter(r => r.isIncluded)
  }

  /**
   * Include a relation by setting the isIncluded
   * option to true.
   */
  public includeRelation(
    property: string | keyof M,
    closure?: (query: ModelQueryBuilder) => any
  ) {
    // TODO
    // if (relation.includes('.')) {}
    const model = this.Model.name
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
}
