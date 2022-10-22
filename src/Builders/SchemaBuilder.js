/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { String } from '@athenna/common'
import { Database } from '#src/index'

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
   * Set if schema should be synchronized with database.
   *
   * @return {boolean}
   */
  synchronize = false

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
   * Set if schema should be synchronized with database.
   *
   * @return {SchemaBuilder}
   */
  isToSynchronize() {
    const connection =
      this.connection === 'default'
        ? Config.get('database.default')
        : this.connection

    this.synchronize = Config.get(
      `database.connections.${connection}.synchronize`,
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

    columns = columns.map(column => reversedColumns[column] || column)

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

  /**
   * Synchronize this schema with database.
   *
   * @return {Promise<void>}
   */
  async sync() {
    if (!this.synchronize) {
      return
    }

    const DB = Database.connection(this.connection)

    return DB.createTable(this.table, builder => {
      this.columns.forEach(column => {
        if (column.createDate || column.updateDate) {
          return
        }

        const build = builder[column.type](column.name, column.length)

        if (column.default) build.defaultTo(column.default)
        if (column.isUnique) build.unique()
        if (column.isPrimary) build.primary()
        if (column.isNullable) build.nullable()
      })

      const createDateColumn = this.columns.find(column => column.createDate)

      if (createDateColumn) {
        const isCamelCase =
          createDateColumn.name === String.toCamelCase(createDateColumn.name)

        builder.timestamps(true, true, isCamelCase)
      }
    })
  }
}
