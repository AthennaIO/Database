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
import { Is, Json, Options } from '@athenna/common'
import type { Operations, LockOptions, SearchOptions } from '#src/types'
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { BaseKnexDriver } from '#src/database/drivers/BaseKnexDriver'
import type { ConnectionOptions } from '#src/types/ConnectionOptions'
import { LockTimeoutException } from '#src/exceptions/LockTimeoutException'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { EmptyColumnException } from '#src/exceptions/EmptyColumnException'
import { CheckViolationException } from '#src/exceptions/CheckViolationException'
import { UniqueViolationException } from '#src/exceptions/UniqueViolationException'
import { NotNullViolationException } from '#src/exceptions/NotNullViolationException'
import { ForeignKeyViolationException } from '#src/exceptions/ForeignKeyViolationException'

export class SqliteDriver extends BaseKnexDriver {
  protected supportsReturning = true
  protected supportsNullsOrdering = true

  /**
   * The tail of each named lock's waiting chain, keyed by
   * "connection:key". A lock() call waits on the current tail and
   * installs its own promise as the new one, which serializes all
   * callers for the same key.
   */
  private static lockTails: Map<string, Promise<void>> = new Map()

  /**
   * Run the closure while holding an exclusive named lock. SQLite is
   * an embedded, single-file database, so the lock is an in-process
   * mutex: callers of the same key inside this process are serialized.
   * It does NOT protect against other processes writing to the same
   * database file.
   */
  public async lock<T = any>(
    key: string,
    closure: () => T | Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    const tailKey = `${this.connection}:${key}`
    const previous = SqliteDriver.lockTails.get(tailKey) || Promise.resolve()

    let release: () => void
    const current = new Promise<void>(resolve => (release = resolve))

    SqliteDriver.lockTails.set(tailKey, current)

    if (options.timeout) {
      let timer: NodeJS.Timeout

      try {
        await Promise.race([
          previous,
          new Promise((_resolve, reject) => {
            timer = setTimeout(
              () => reject(new LockTimeoutException(key, options.timeout)),
              options.timeout
            )
          })
        ])
      } catch (error) {
        /**
         * This call is already the tail other callers wait on, so a
         * timed out waiter can't just leave: it hands its slot through
         * as soon as the previous holder releases.
         */
        previous.then(() => release())

        throw error
      } finally {
        clearTimeout(timer)
      }
    } else {
      await previous
    }

    try {
      return await closure()
    } finally {
      release()

      if (SqliteDriver.lockTails.get(tailKey) === current) {
        SqliteDriver.lockTails.delete(tailKey)
      }
    }
  }

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
      pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: false,
      useNullAsDefault: false,
      ...Json.omit(configs, ['driver', 'validations']),
      migrations: {
        tableName: 'migrations',
        ...(configs.migrations || {})
      }
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
      const { sql, bindings } = this.compileJsonWhere(
        parsed,
        normalized.operator,
        normalized.value
      )

      this.qb.whereRaw(sql, bindings)

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
      const { sql, bindings } = this.compileJsonWhere(
        parsed,
        normalized.operator,
        normalized.value
      )

      this.qb.orWhereRaw(sql, bindings)

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
   * Compile the scalar extraction:
   *
   * ```sql
   * json_extract(`metadata`, '$.key')
   * ```
   */
  protected compileJsonScalar(column: string, path: string[]) {
    return {
      sql: 'json_extract(??, ?)',
      bindings: [column, this.toJsonPath(path)]
    }
  }

  /**
   * Compile the shallow merge setting each first level key, since
   * `json_patch` would merge nested objects deeply:
   *
   * ```sql
   * json_set(coalesce(`metadata`, '{}'), '$.key', json('"value"'))
   * ```
   */
  protected compileJsonMerge(column: string, object: Record<string, any>) {
    const keys = Object.keys(object)

    if (!keys.length) {
      return { sql: "coalesce(??, '{}')", bindings: [column] }
    }

    return {
      sql: `json_set(coalesce(??, '{}'), ${keys
        .map(() => '?, json(?)')
        .join(', ')})`,
      bindings: [
        column,
        ...keys.flatMap(key => [
          this.toJsonPath([key]),
          JSON.stringify(object[key] === undefined ? null : object[key])
        ])
      ]
    }
  }

  /**
   * Compile the increment. SQLite creates the missing parents of
   * the path by itself:
   *
   * ```sql
   * json_set(coalesce(`metadata`, '{}'), '$.count', coalesce(json_extract(`metadata`, '$.count'), 0) + 1)
   * ```
   */
  protected compileJsonIncrement(column: string, path: string[], by: number) {
    const target = this.toJsonPath(path)

    return {
      sql: "json_set(coalesce(??, '{}'), ?, coalesce(json_extract(??, ?), 0) + ?)",
      bindings: [column, target, column, target, by]
    }
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
  public whereILike(column: string, value: any, _options?: SearchOptions) {
    if (this.isUsingJsonSelector(column)) {
      return this.whereJson(column, 'ilike', value)
    }

    this.qb.whereLike(column, value)

    return this
  }

  /**
   * Set a where ILike statement in your query.
   */
  public orWhereILike(column: string, value: any, _options?: SearchOptions) {
    if (this.isUsingJsonSelector(column)) {
      return this.orWhereJson(column, 'ilike', value)
    }

    this.qb.orWhereLike(column, value)

    return this
  }

  /**
   * SQLite full text search requires an FTS5 virtual table, which
   * can't be expressed on top of a regular table. This is a fallback
   * that builds a grouped `LIKE '%value%'` across the given columns,
   * so the same code works when using SQLite for tests and Postgres
   * or MySQL in production. Options are ignored.
   */
  public whereFullText(columns: string | string[], value: string) {
    const names = this.parseFullTextColumns('whereFullText', columns, value)

    this.qb.where(qb => this.compileFullTextFallback(qb, names, value))

    return this
  }

  /**
   * Same fallback of `whereFullText()` but as an `OR` clause.
   */
  public orWhereFullText(columns: string | string[], value: string) {
    const names = this.parseFullTextColumns('orWhereFullText', columns, value)

    this.qb.orWhere(qb => this.compileFullTextFallback(qb, names, value))

    return this
  }

  /**
   * Add a `column LIKE '%value%'` for each column joined by `OR`.
   */
  private compileFullTextFallback(qb: any, columns: string[], value: string) {
    debug(
      'sqlite does not support full text search on regular tables, falling back to LIKE'
    )

    columns.forEach((column, i) => {
      const method = i === 0 ? 'whereLike' : 'orWhereLike'

      qb[method](column, `%${value}%`)
    })
  }

  /**
   * Translate a SQLite error into a normalized Athenna constraint violation
   * exception. SQLite exposes extended result codes (e.g.
   * `SQLITE_CONSTRAINT_UNIQUE`) and a message like
   * `UNIQUE constraint failed: table.column`.
   *
   * @see https://www.sqlite.org/rescode.html
   */
  public parseError(error: any) {
    const code = error?.code ?? ''
    const message = error?.message ?? ''
    const driver = 'sqlite'

    /**
     * Parses `table.column[, table.column]` lists out of the failure message.
     */
    const parseColumns = () => {
      const match = /constraint failed:\s*(.+)$/i.exec(message)

      if (!match) {
        return { table: undefined, columns: undefined }
      }

      const refs = match[1].split(',').map(ref => ref.trim())
      const columns = refs.map(ref => ref.split('.').pop())
      const table = refs[0]?.includes('.') ? refs[0].split('.')[0] : undefined

      return { table, columns }
    }

    if (
      code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      code === 'SQLITE_CONSTRAINT_PRIMARYKEY' ||
      /UNIQUE constraint failed/i.test(message)
    ) {
      const { table, columns } = parseColumns()

      return new UniqueViolationException({
        table,
        columns,
        driver,
        raw: error
      })
    }

    if (
      code === 'SQLITE_CONSTRAINT_NOTNULL' ||
      /NOT NULL constraint failed/i.test(message)
    ) {
      const { table, columns } = parseColumns()

      return new NotNullViolationException({
        table,
        column: columns?.[0],
        driver,
        raw: error
      })
    }

    if (
      code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
      /FOREIGN KEY constraint failed/i.test(message)
    ) {
      return new ForeignKeyViolationException({ driver, raw: error })
    }

    if (
      code === 'SQLITE_CONSTRAINT_CHECK' ||
      /CHECK constraint failed/i.test(message)
    ) {
      const match = /CHECK constraint failed:\s*(.+)$/i.exec(message)

      return new CheckViolationException({
        constraint: match?.[1]?.trim(),
        driver,
        raw: error
      })
    }

    return null
  }
}
