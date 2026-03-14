/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import type { Operations } from '#src/types'
import { Is, Json, Options } from '@athenna/common'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { BaseKnexDriver } from '#src/database/drivers/BaseKnexDriver'
import type { ConnectionOptions } from '#src/types/ConnectionOptions'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { EmptyColumnException } from '#src/exceptions/EmptyColumnException'

export class PostgresDriver extends BaseKnexDriver {
  /**
   * Connect to database.
   */
  public connect(options: ConnectionOptions = {}): void {
    options = Options.create(options, {
      force: false,
      saveOnFactory: true,
      connect: true
    })

    if (!options.connect) {
      return
    }

    if (this.isConnected && !options.force) {
      return
    }

    const knex = this.getKnex()
    const configs = Config.get(`database.connections.${this.connection}`, {})
    const knexOpts = {
      client: 'pg',
      migrations: {
        tableName: 'migrations'
      },
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: false,
      useNullAsDefault: false,
      ...Json.omit(configs, ['driver', 'validations'])
    }

    debug('creating new connection using Knex. options defined: %o', knexOpts)

    if (Config.is('rc.bootLogs', true)) {
      Log.channelOrVanilla('application').success(
        `Successfully connected to ({yellow} ${this.connection}) database connection`
      )
    }

    this.client = knex.default(knexOpts)

    this.isConnected = true
    this.isSavedOnFactory = options.saveOnFactory

    if (this.isSavedOnFactory) {
      ConnectionFactory.setClient(this.connection, this.client)
    }

    this.qb = this.query()
  }

  /**
   * Close the connection with database in this instance.
   */
  public async close(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    await this.client.destroy()

    this.qb = null
    this.tableName = null
    this.client = null
    this.isConnected = false

    ConnectionFactory.setClient(this.connection, null)
  }

  /**
   * List all databases available.
   */
  public async getDatabases(): Promise<string[]> {
    const { rows: databases } = await this.raw(
      'SELECT datname FROM pg_database'
    )

    return databases.map(database => database.datname)
  }

  /**
   * Create a new database.
   */
  public async createDatabase(database: string): Promise<void> {
    /**
     * Catching the error to simulate IF NOT EXISTS
     */
    try {
      await this.raw('CREATE DATABASE ??', database)
    } catch (_err) {}
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    /**
     * Catching the error to simulate IF EXISTS
     */
    try {
      await this.raw('DROP DATABASE ??', database)
    } catch (_err) {}
  }

  /**
   * List all tables available.
   */
  public async getTables(): Promise<string[]> {
    const { rows: tables } = await this.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
      await this.getCurrentDatabase()
    )

    return tables.map(table => table.table_name)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    await this.raw('TRUNCATE TABLE ?? CASCADE', table)
  }

  /**
   * Create many values in database.
   */
  public async createMany<T = any>(data: Partial<T>[] = []): Promise<T[]> {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    const preparedData = data.map(data => this.prepareInsert(data))

    return this.qb.insert(preparedData, '*')
  }

  public whereJson(column: string, value: any): this
  public whereJson(column: string, operation: Operations, value: any): this

  /**
   * Set a where json statement in your query.
   */
  public whereJson(column: string, operator: any, value?: any) {
    if (Is.Undefined(column) || !Is.String(column)) {
      throw new EmptyColumnException('whereJson')
    }

    const parsed = this.parseJsonSelector(column)

    if (!parsed) {
      throw new Error(`Invalid JSON selector: ${column}`)
    }

    if (!parsed.path.includes('*')) {
      return super.whereJson(column, operator, value)
    }

    const path = this.parseJsonSelectorToWildcardPath(parsed.path)
    const normalized = this.normalizeJsonOperation(operator, value)

    this.qb.whereRaw('jsonb_path_exists(??, ?::jsonpath, ?::jsonb)', [
      parsed.column,
      `${path} ? (@ ${normalized.operator} $value)`,
      JSON.stringify({ value: normalized.value })
    ])

    return this
  }

  public orWhereJson(column: string, value: any): this
  public orWhereJson(column: string, operation: Operations, value: any): this

  /**
   * Set an or where json statement in your query.
   */
  public orWhereJson(column: string, operator: any, value?: any) {
    if (Is.Undefined(column) || !Is.String(column)) {
      throw new EmptyColumnException('orWhereJson')
    }

    const parsed = this.parseJsonSelector(column)

    if (!parsed) {
      throw new Error(`Invalid JSON selector: ${column}`)
    }

    if (!parsed.path.includes('*')) {
      return super.orWhereJson(column, operator, value)
    }

    const path = this.parseJsonSelectorToWildcardPath(parsed.path)
    const normalized = this.normalizeJsonOperation(operator, value)

    this.qb.orWhereRaw('jsonb_path_exists(??, ?::jsonpath, ?::jsonb)', [
      parsed.column,
      `${path} ? (@ ${normalized.operator} $value)`,
      JSON.stringify({ value: normalized.value })
    ])

    return this
  }

  /**
   * Convert a json selector path to a valid postgres json path.
   */
  private parseJsonSelectorToWildcardPath(path: string) {
    const parts = path
      .split('->')
      .map(part => part.trim())
      .filter(Boolean)

    return parts.reduce((jsonPath, part) => {
      if (part === '*') {
        return `${jsonPath}[*]`
      }

      if (/^\d+$/.test(part)) {
        return `${jsonPath}[${part}]`
      }

      return `${jsonPath}.${part}`
    }, '$')
  }

  /**
   * Normalize operator/value pair for postgres json path comparisons.
   */
  private normalizeJsonOperation(operator: any, value?: any) {
    if (Is.Undefined(value)) {
      return {
        operator: '==',
        value: operator
      }
    }

    return {
      operator: this.getJsonPathOperator(operator),
      value
    }
  }

  /**
   * Convert query operators to postgres json path operators.
   */
  private getJsonPathOperator(operator: string) {
    const operators = {
      '=': '==',
      '==': '==',
      '!=': '!=',
      '<>': '!=',
      '>': '>',
      '>=': '>=',
      '<': '<',
      '<=': '<='
    }

    return operators[operator] || operator
  }
}
