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

export class SqliteDriver extends BaseKnexDriver {
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
      client: 'better-sqlite3',
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
   * List all databases available.
   */
  public async getDatabases(): Promise<string[]> {
    const databases = await this.raw('PRAGMA database_list')

    return databases.map(database => database.name)
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
    const tables = await this.raw(
      "SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
      await this.getCurrentDatabase()
    )

    return tables.map(table => table.name)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    await this.raw('DELETE FROM ??', table)
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

  /**
   * Find a value in database.
   */
  public async find<T = any>(): Promise<T> {
    const data = await super.find<T>()

    return this.normalizeRow(data)
  }

  /**
   * Find many values in database.
   */
  public async findMany<T = any>(): Promise<T[]> {
    const data = await super.findMany<T>()

    return data.map(row => this.normalizeRow(row))
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

    const normalized = this.normalizeJsonOperation(operator, value)

    if (!parsed.path.includes('*')) {
      this.qb.whereRaw('json_extract(??, ?) ' + normalized.operator + ' ?', [
        parsed.column,
        this.parseJsonSelectorToSqlitePath(parsed.path),
        normalized.value
      ])

      return this
    }

    const wildcard = this.parseJsonSelectorToWildcardParts(parsed.path)

    this.qb.whereRaw(
      'exists (select 1 from json_each(??, ?) where json_extract(json_each.value, ?) ' +
        normalized.operator +
        ' ?)',
      [parsed.column, wildcard.arrayPath, wildcard.valuePath, normalized.value]
    )

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

    const normalized = this.normalizeJsonOperation(operator, value)

    if (!parsed.path.includes('*')) {
      this.qb.orWhereRaw('json_extract(??, ?) ' + normalized.operator + ' ?', [
        parsed.column,
        this.parseJsonSelectorToSqlitePath(parsed.path),
        normalized.value
      ])

      return this
    }

    const wildcard = this.parseJsonSelectorToWildcardParts(parsed.path)

    this.qb.orWhereRaw(
      'exists (select 1 from json_each(??, ?) where json_extract(json_each.value, ?) ' +
        normalized.operator +
        ' ?)',
      [parsed.column, wildcard.arrayPath, wildcard.valuePath, normalized.value]
    )

    return this
  }

  /**
   * Convert a json selector path to sqlite json path.
   */
  private parseJsonSelectorToSqlitePath(path: string) {
    const parts = path
      .split('->')
      .map(part => part.trim())
      .filter(Boolean)

    return this.toJsonPath(parts)
  }

  /**
   * Split a json selector around the wildcard.
   */
  private parseJsonSelectorToWildcardParts(path: string) {
    const parts = path
      .split('->')
      .map(part => part.trim())
      .filter(Boolean)

    const wildcardIndex = parts.indexOf('*')

    return {
      arrayPath: this.toJsonPath(parts.slice(0, wildcardIndex)),
      valuePath: this.toJsonPath(parts.slice(wildcardIndex + 1))
    }
  }

  /**
   * Convert path parts to a valid json path.
   */
  private toJsonPath(parts: string[]) {
    return parts.reduce((jsonPath, part) => {
      if (/^\d+$/.test(part)) {
        return `${jsonPath}[${part}]`
      }

      return `${jsonPath}.${part}`
    }, '$')
  }

  /**
   * Normalize operator/value pairs from the whereJson overloads.
   */
  private normalizeJsonOperation(operator: any, value?: any) {
    if (Is.Undefined(value)) {
      return {
        operator: '=',
        value: operator
      }
    }

    return {
      operator,
      value
    }
  }

  /**
   * Normalize json strings returned by sqlite into arrays/objects.
   */
  private normalizeRow<T = any>(row: T): T {
    if (!row || !Is.Object(row)) {
      return row
    }

    return Object.entries(row).reduce((normalized, [key, value]) => {
      normalized[key] = this.normalizeJsonValue(value)

      return normalized
    }, {} as T)
  }

  /**
   * Parse stringified json objects/arrays returned by sqlite.
   */
  private normalizeJsonValue(value: any) {
    if (!Is.String(value)) {
      return value
    }

    const trimmed = value.trim()

    if (
      !(trimmed.startsWith('{') && trimmed.endsWith('}')) &&
      !(trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      return value
    }

    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }

  /**
   * Set a where ILike statement in your query.
   */
  public whereILike(column: string, value: any) {
    this.qb.whereLike(column, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public orWhereILike(column: string, value: any) {
    this.qb.orWhereLike(column, value)

    return this
  }
}
