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
import type { ConnectionOptions } from '#src/types/ConnectionOptions'
import { BaseKnexDriver } from '#src/database/drivers/BaseKnexDriver'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { EmptyColumnException } from '#src/exceptions/EmptyColumnException'

export class MySqlDriver extends BaseKnexDriver {
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
      client: 'mysql2',
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
    const [databases] = await this.raw('SHOW DATABASES')

    return databases.map(database => database.Database)
  }

  /**
   * Create a new database.
   */
  public async createDatabase(database: string): Promise<void> {
    await this.raw('CREATE DATABASE IF NOT EXISTS ??', database)
  }

  /**
   * Drop some database.
   */
  public async dropDatabase(database: string): Promise<void> {
    await this.raw('DROP DATABASE IF EXISTS ??', database)
  }

  /**
   * List all tables available.
   */
  public async getTables(): Promise<string[]> {
    const [tables] = await this.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
      await this.getCurrentDatabase()
    )

    return tables.map(table => table.TABLE_NAME)
  }

  /**
   * Remove all data inside some database table
   * and restart the identity of the table.
   */
  public async truncate(table: string): Promise<void> {
    try {
      await this.raw('SET FOREIGN_KEY_CHECKS = 0')
      await this.raw('TRUNCATE TABLE ??', table)
    } finally {
      await this.raw('SET FOREIGN_KEY_CHECKS = 1')
    }
  }

  /**
   * Create many values in database.
   */
  public async createMany<T = any>(data: Partial<T>[] = []): Promise<T[]> {
    if (!Is.Array(data)) {
      throw new WrongMethodException('createMany', 'create')
    }

    const preparedData = data.map(data => this.prepareInsert(data))
    const ids = []

    const promises = preparedData.map((prepared, index) => {
      return this.qb
        .clone()
        .insert(prepared)
        .then(([id]) => ids.push(data[index][this.primaryKey] || id))
    })

    await Promise.all(promises)

    return this.whereIn(this.primaryKey, ids).findMany()
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
      this.qb.whereRaw(
        'JSON_UNQUOTE(JSON_EXTRACT(??, ?)) ' + normalized.operator + ' ?',
        [
          parsed.column,
          this.parseJsonSelectorToMySqlPath(parsed.path),
          normalized.value
        ]
      )

      return this
    }

    const wildcard = this.parseJsonSelectorToWildcardParts(parsed.path)

    this.qb.whereRaw(
      "exists (select 1 from json_table(json_extract(??, ?), '$[*]' columns (value json path ?)) as jt where JSON_UNQUOTE(jt.value) " +
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
      this.qb.orWhereRaw(
        'JSON_UNQUOTE(JSON_EXTRACT(??, ?)) ' + normalized.operator + ' ?',
        [
          parsed.column,
          this.parseJsonSelectorToMySqlPath(parsed.path),
          normalized.value
        ]
      )

      return this
    }

    const wildcard = this.parseJsonSelectorToWildcardParts(parsed.path)

    this.qb.orWhereRaw(
      "exists (select 1 from json_table(json_extract(??, ?), '$[*]' columns (value json path ?)) as jt where JSON_UNQUOTE(jt.value) " +
        normalized.operator +
        ' ?)',
      [parsed.column, wildcard.arrayPath, wildcard.valuePath, normalized.value]
    )

    return this
  }

  /**
   * Convert a json selector path to mysql json path.
   */
  private parseJsonSelectorToMySqlPath(path: string) {
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
}
