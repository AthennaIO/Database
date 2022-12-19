import { NotImplementedRelationException } from '#src/Exceptions/NotImplementedRelationException'

/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class SchemaBuilder {
  /**
   * Set the table name of this schema instance.
   *
   * @return {string}
   */
  name = null

  /**
   * Set the table name of this schema instance.
   *
   * @return {string}
   */
  table = null

  /**
   * Set the db connection that this schema instance will work with.
   *
   * @return {string}
   */
  connection = 'default'

  /**
   * All the model columns mapped
   *
   * @type {any[]}
   */
  columns = []

  /**
   * Dictionary to specify the column name in database to class property.
   *
   * @type {Record<string, string>}
   */
  columnDictionary = {}

  /**
   * All the model relations mapped
   *
   * @type {any[]}
   */
  relations = []

  /**
   * Set the connection of schema.
   *
   * @param {string} connection
   * @return {SchemaBuilder}
   */
  setConnection(connection) {
    this.connection = connection

    return this
  }

  /**
   * Set the schema name.
   *
   * @param name
   * @return {SchemaBuilder}
   */
  setName(name) {
    this.name = name

    return this
  }

  /**
   * Set the table name.
   *
   * @param tableName
   * @return {SchemaBuilder}
   */
  setTable(tableName) {
    this.table = tableName

    return this
  }

  /**
   * Convert the schema columns and relations to array and set.
   *
   * @param schema {any}
   */
  setSchema(schema) {
    return this.setColumns(schema).setRelations(schema)
  }

  /**
   * Convert to array and set the columns.
   *
   * @param columns {any}
   * @return {SchemaBuilder}
   */
  setColumns(columns) {
    Object.keys(columns).forEach(key => {
      const column = columns[key]

      if (column.isRelation) {
        return
      }

      if (!column.name) {
        column.name = key
      }

      this.columnDictionary[key] = column.name

      this.columns.push(column)
    })

    return this
  }

  /**
   * Convert to array and set the columns.
   *
   * @param relations {any}
   * @return {SchemaBuilder}
   */
  setRelations(relations) {
    Object.keys(relations).forEach(key => {
      const relation = relations[key]

      if (relation.isColumn) {
        return
      }

      relation.name = key
      relation.isIncluded = false

      this.relations.push(relation)
    })

    return this
  }

  /**
   * Get all available relations as string or null..
   *
   * @return {string|null}
   */
  getAvailableRelationsString() {
    return this.relations.length ? this.relations.join(',') : null
  }

  /**
   * Find the relation object by name.
   *
   * @param relationName {string}
   * @return {any}
   */
  getRelationByName(relationName) {
    return this.relations.find(relation => relationName === relation.name)
  }

  /**
   * Find the relation object by model.
   *
   * @param Model {typeof import('#src/index').Model}
   * @return {any}
   */
  getRelationByModel(Model) {
    return this.relations.find(relation => Model === relation.model)
  }

  /**
   * Include nested relations.
   *
   * @param modelName {string}
   * @param nestedRelationNames {string}
   * @param lastCallback {any}
   * @return {any}
   */
  includeNestedRelations(modelName, nestedRelationNames, lastCallback) {
    const relationsArray = nestedRelationNames.split('.')

    const mainRelationName = relationsArray.shift()
    const callback = relationsArray.reduce((cb, relationName, index) => {
      if (index === relationsArray.length - 1) {
        cb = query => query.with(relationName, lastCallback)
      } else {
        cb = query => query.with(relationName, cb)
      }

      return cb
    }, undefined)

    return this.includeRelation(modelName, mainRelationName, callback)
  }

  /**
   * Include nested has relations.
   *
   * @param modelName {string}
   * @param nestedRelationNames {string}
   * @param lastCallback {any}
   * @param operation {string}
   * @param count {number}
   * @return {any}
   */
  includeNestedHasRelations(
    modelName,
    nestedRelationNames,
    lastCallback,
    operation,
    count,
  ) {
    const relationsArray = nestedRelationNames.split('.')

    const mainRelationName = relationsArray.shift()
    const callback = relationsArray.reduce((cb, relationName, index) => {
      if (index === relationsArray.length - 1) {
        cb = query =>
          query.whereHas(relationName, lastCallback, operation, count)
      } else {
        cb = query => query.whereHas(relationName, cb, '>=', 1)
      }

      return cb
    }, undefined)

    return this.includeHasRelation(
      modelName,
      mainRelationName,
      callback,
      '>=',
      1,
    )
  }

  /**
   * Set isIncluded as true as the has map in the relation.
   *
   * @param {string} modelName
   * @param {string} relationName
   * @param {any} callback
   * @param {string} operation
   * @param {number} count
   * @return {any}
   */
  includeHasRelation(modelName, relationName, callback, operation, count) {
    const relation = this.getRelationByName(relationName)

    if (!relation) {
      throw new NotImplementedRelationException(
        relationName,
        modelName,
        this.getAvailableRelationsString(),
      )
    }

    relation.has = { count, operation }
    relation.isIncluded = true
    relation.callback = callback

    const index = this.relations.indexOf(relation)
    this.relations[index] = relation

    return this.relations[index]
  }

  /**
   * Set isIncluded as true in the relation.
   *
   * @param {string} modelName
   * @param {string} relationName
   * @param {any} callback
   * @return {any}
   */
  includeRelation(modelName, relationName, callback) {
    const relation = this.getRelationByName(relationName)

    if (!relation) {
      throw new NotImplementedRelationException(
        relationName,
        modelName,
        this.getAvailableRelationsString(),
      )
    }

    relation.isIncluded = true
    relation.callback = callback

    const index = this.relations.indexOf(relation)
    this.relations[index] = relation

    return this.relations[index]
  }

  /**
   * Verify if schema has timestamp properties.
   *
   * @return {boolean}
   */
  hasTimestamp() {
    return this.hasCreatedAt() && this.hasUpdatedAt()
  }

  /**
   * Verify if schema has created at property.
   *
   * @return {boolean}
   */
  hasCreatedAt() {
    return !!this.columns.find(column => column.createDate)
  }

  /**
   * Verify if schema has updated at property.
   *
   * @return {boolean}
   */
  hasUpdatedAt() {
    return !!this.columns.find(column => column.updateDate)
  }

  /**
   * Verify if schema has deleted at property.
   *
   * @return {boolean}
   */
  hasDeletedAt() {
    return !!this.columns.find(column => column.deleteDate)
  }

  /**
   * Get the created at column name.
   *
   * @return {string}
   */
  getCreatedAt() {
    return this.columns.find(column => column.createDate).name
  }

  /**
   * Get the created at column name.
   *
   * @return {string}
   */
  getUpdatedAt() {
    return this.columns.find(column => column.updateDate).name
  }

  /**
   * Get the deleted at column name.
   *
   * @return {string}
   */
  getDeletedAt() {
    return this.columns.find(column => column.deleteDate).name
  }

  /**
   * Get all the relations that has the "isIncluded"
   * property as true.
   *
   * @return {any[]}
   */
  getIncludedRelations() {
    return this.relations.filter(relation => relation.isIncluded)
  }

  /**
   * Get the column dictionary.
   *
   * @return {any}
   */
  getColumnDictionary() {
    return this.columnDictionary
  }

  /**
   * Get the column name of a reversed column name.
   *
   * @param reversedColumnName {string}
   * @return {string}
   */
  getColumnNameOf(reversedColumnName) {
    return this.columnDictionary[reversedColumnName] || reversedColumnName
  }

  /**
   * Get the column names of a reversed columns.
   *
   * @param reversedColumns {string[]}
   * @return {string[]}
   */
  getColumnNamesOf(reversedColumns) {
    const columns = this.getColumnDictionary()

    return reversedColumns.map(
      reversedColumn => columns[reversedColumn] || reversedColumn,
    )
  }

  /**
   * Return an object statement with keys.
   *
   * @param reversedStatement {any}
   * @return {any}
   */
  getStatementNamesOf(reversedStatement) {
    const newStatement = {}

    Object.keys(reversedStatement).forEach(key => {
      newStatement[this.getColumnNameOf(key)] = reversedStatement[key]
    })

    return newStatement
  }

  /**
   * Get the column dictionary reversed.
   *
   * @return {any}
   */
  getReversedColumnDictionary() {
    const reserveDictionary = {}

    Object.keys(this.columnDictionary).forEach(
      key => (reserveDictionary[this.columnDictionary[key]] = key),
    )

    return reserveDictionary
  }

  /**
   * Get the reverse column name of a column name.
   *
   * @param columnName {string}
   * @return {string}
   */
  getReversedColumnNameOf(columnName) {
    const reversedColumns = this.getReversedColumnDictionary()

    return reversedColumns[columnName] || columnName
  }

  /**
   * Get the reverse column names of a columns.
   *
   * @param columns {string[]}
   * @return {string[]}
   */
  getReversedColumnNamesOf(columns) {
    const reversedColumns = this.getReversedColumnDictionary()

    return columns.map(column => reversedColumns[column] || column)
  }

  /**
   * Return an object statement with reversed keys.
   *
   * @param statement {any}
   * @return {any}
   */
  getReversedStatementNamesOf(statement) {
    const newStatement = {}

    Object.keys(statement).forEach(key => {
      newStatement[this.getReversedColumnNameOf(key)] = statement[key]
    })

    return newStatement
  }
}
