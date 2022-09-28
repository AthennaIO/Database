/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@secjs/utils'

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
  buildConnection(connection) {
    this.connection = connection

    return this
  }

  /**
   * Set the schema name.
   *
   * @param name
   * @return {SchemaBuilder}
   */
  buildName(name) {
    this.name = name

    return this
  }

  /**
   * Set the table name.
   *
   * @param tableName
   * @return {SchemaBuilder}
   */
  buildTable(tableName) {
    this.tableName = tableName

    return this
  }

  /**
   * Convert the schema columns and relations to array and set.
   *
   * @param schema {any}
   */
  buildSchema(schema) {
    return this.buildColumns(schema).buildRelations(schema)
  }

  /**
   * Convert to array and set the columns.
   *
   * @param columns {any}
   * @return {SchemaBuilder}
   */
  buildColumns(columns) {
    Object.keys(columns).forEach(key => {
      const column = columns[key]

      if (column.isRelation) {
        return
      }

      if (!column.name) {
        column.name = key
      }

      delete column.isColumn

      this.columnDictionary[key] = column.name
      this.columns.push(column)
    })
  }

  /**
   * Convert to array and set the columns.
   *
   * @param relations {any}
   * @return {SchemaBuilder}
   */
  buildRelations(relations) {
    Object.keys(relations).forEach(key => {
      const relation = relations[key]

      if (relation.isColumn) {
        return
      }

      delete relation.isRelation

      relation.isIncluded = false
      this.relations.push(relation)
    })
  }

  /**
   * Set if schema should be synchronized with database.
   *
   * @return {SchemaBuilder}
   */
  isToSynchronize() {
    this.synchronize = Config.get(
      `database.connections.${this.connection}.synchronize`,
      false,
    )

    return this
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

    return reversedColumns[columnName]
  }

  /**
   * Get the reverse column names of a columns.
   *
   * @param columns {string[]}
   * @return {string[]}
   */
  getReversedColumnNamesOf(columns) {
    const reversedColumns = this.getReversedColumnDictionary()

    columns = columns.map(column => reversedColumns[column])

    return columns
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
