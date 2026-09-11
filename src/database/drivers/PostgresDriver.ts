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
import { ConnectionFactory } from '#src/factories/ConnectionFactory'
import { BaseKnexDriver } from '#src/database/drivers/BaseKnexDriver'
import type { ConnectionOptions } from '#src/types/ConnectionOptions'
import { LockTimeoutException } from '#src/exceptions/LockTimeoutException'
import { WrongMethodException } from '#src/exceptions/WrongMethodException'
import { EmptyColumnException } from '#src/exceptions/EmptyColumnException'
import type { Operations, LockOptions, FullTextSearchOptions } from '#src/types'
import { CheckViolationException } from '#src/exceptions/CheckViolationException'
import { UniqueViolationException } from '#src/exceptions/UniqueViolationException'
import { NotNullViolationException } from '#src/exceptions/NotNullViolationException'
import { ForeignKeyViolationException } from '#src/exceptions/ForeignKeyViolationException'

export class PostgresDriver extends BaseKnexDriver {
  protected supportsReturning = true
  protected supportsILike = true
  protected supportsUnaccent = true
  protected supportsNullsOrdering = true

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

  /**
   * Compile the Postgres full text search statement:
   *
   * ```sql
   * to_tsvector('simple', coalesce("a", '') || ' ' || coalesce("b", ''))
   *   @@ plainto_tsquery('simple', ?)
   * ```
   *
   * It works without an index, but Postgres will compute the
   * `tsvector` for every row. To make it use a GIN index, create
   * it in your migration with EXACTLY the same expression and
   * language:
   *
   * ```sql
   * CREATE INDEX users_name_fulltext ON users
   *   USING GIN (to_tsvector('simple', coalesce("name", '')))
   * ```
   *
   * `options.mode` as `boolean` switches to `websearch_to_tsquery`,
   * which understands quoted phrases, `-word` and `OR`.
   */
  protected compileFullText(
    columns: string[],
    value: string,
    options: FullTextSearchOptions
  ) {
    const language = (options.language ?? 'simple').replace(/'/g, "''")
    const parser =
      options.mode === 'boolean' ? 'websearch_to_tsquery' : 'plainto_tsquery'

    const document = columns.map(() => "coalesce(??, '')").join(" || ' ' || ")

    return {
      sql: `to_tsvector('${language}', ${document}) @@ ${parser}('${language}', ?)`,
      bindings: [...columns, value]
    }
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

    if (this.isScalarJsonWhere(parsed, normalized.value)) {
      const { sql, bindings } = this.compileJsonWhere(
        parsed,
        normalized.operator,
        normalized.value
      )

      this.qb.whereRaw(sql, bindings)

      return this
    }

    const path = this.parseJsonSelectorToWildcardPath(parsed.path)

    this.qb.whereRaw('jsonb_path_exists(??, ?::jsonpath, ?::jsonb)', [
      parsed.column,
      `${path} ? (@ ${this.getJsonPathOperator(normalized.operator)} $value)`,
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

    const normalized = this.normalizeJsonOperation(operator, value)

    if (this.isScalarJsonWhere(parsed, normalized.value)) {
      const { sql, bindings } = this.compileJsonWhere(
        parsed,
        normalized.operator,
        normalized.value
      )

      this.qb.orWhereRaw(sql, bindings)

      return this
    }

    const path = this.parseJsonSelectorToWildcardPath(parsed.path)

    this.qb.orWhereRaw('jsonb_path_exists(??, ?::jsonpath, ?::jsonb)', [
      parsed.column,
      `${path} ? (@ ${this.getJsonPathOperator(normalized.operator)} $value)`,
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

  /**
   * Whether the where should extract the scalar with `->>`/`#>>`
   * and compare it in SQL, which lets the planner use expression
   * indexes such as `((metadata->>'key'))`. Wildcards and JSON
   * values (objects) still go through `jsonb_path_exists`.
   */
  private isScalarJsonWhere(parsed: { path: string }, value: any) {
    if (parsed.path.includes('*')) {
      return false
    }

    return !Is.Object(value)
  }

  /**
   * Compile the scalar extraction. A single key uses `->>` to
   * match expression indexes literally and deeper paths use `#>>`.
   */
  protected compileJsonScalar(column: string, path: string[]) {
    if (path.length === 1 && !/^\d+$/.test(path[0])) {
      return { sql: '?? ->> ?', bindings: [column, path[0]] }
    }

    return { sql: '?? #>> ?', bindings: [column, this.toTextArray(path)] }
  }

  /**
   * Cast the extracted text by the type of the compared value so
   * numbers and booleans compare as such and not as text.
   */
  protected castJsonScalar(
    expression: { sql: string; bindings: any[] },
    value: any
  ) {
    if (Is.Number(value)) {
      return {
        sql: `(${expression.sql})::numeric`,
        bindings: expression.bindings
      }
    }

    if (Is.Boolean(value)) {
      return {
        sql: `(${expression.sql})::boolean`,
        bindings: expression.bindings
      }
    }

    return expression
  }

  /**
   * Compile the shallow merge:
   *
   * ```sql
   * coalesce("metadata", '{}'::jsonb) || '{"key":"value"}'::jsonb
   * ```
   */
  protected compileJsonMerge(column: string, object: Record<string, any>) {
    return {
      sql: "coalesce(??, '{}'::jsonb) || ?::jsonb",
      bindings: [column, JSON.stringify(object)]
    }
  }

  /**
   * Compile the increment, creating the missing parent objects of
   * the path so `metadata->stats->count` works on `{}`:
   *
   * ```sql
   * jsonb_set(
   *   coalesce("metadata", '{}'::jsonb),
   *   '{count}',
   *   to_jsonb(coalesce(("metadata" #>> '{count}')::numeric, 0) + 1),
   *   true
   * )
   * ```
   */
  protected compileJsonIncrement(column: string, path: string[], by: number) {
    let document = {
      sql: "coalesce(??, '{}'::jsonb)",
      bindings: [column] as any[]
    }

    for (let depth = 1; depth < path.length; depth++) {
      const parent = this.toTextArray(path.slice(0, depth))

      document = {
        sql: `jsonb_set(${document.sql}, ?, coalesce(?? #> ?, '{}'::jsonb), true)`,
        bindings: [...document.bindings, parent, column, parent]
      }
    }

    const target = this.toTextArray(path)

    return {
      sql: `jsonb_set(${document.sql}, ?, to_jsonb(coalesce((?? #>> ?)::numeric, 0) + ?), true)`,
      bindings: [...document.bindings, target, column, target, by]
    }
  }

  /**
   * Convert path parts to a Postgres `text[]` literal, e.g.
   * `{"stats","count"}`.
   */
  private toTextArray(parts: string[]) {
    const quoted = parts.map(part => `"${part.replace(/(["\\])/g, '\\$1')}"`)

    return `{${quoted.join(',')}}`
  }

  /**
   * Run the closure while holding an exclusive named lock, implemented
   * with a transaction-level advisory lock. The lock is tied to a
   * dedicated transaction: Postgres releases it on commit, rollback or
   * connection death, so it can never leak, not even if the process is
   * killed while holding it. The closure itself runs OUTSIDE that
   * transaction — its queries use their own connections and are already
   * committed by the time the lock is released.
   */
  public async lock<T = any>(
    key: string,
    closure: () => T | Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    const trx = await this.startTransaction()

    try {
      if (options.timeout) {
        await trx.raw("SELECT set_config('lock_timeout', ?, true)", [
          `${options.timeout}ms`
        ])
      }

      await trx.raw('SELECT pg_advisory_xact_lock(hashtextextended(?, 0))', [
        key
      ])

      const result = await closure()

      await trx.commitTransaction()

      return result
    } catch (error) {
      await trx.rollbackTransaction().catch(() => {})

      if (error?.code === '55P03') {
        throw new LockTimeoutException(key, options.timeout)
      }

      throw error
    }
  }

  /**
   * Translate a PostgreSQL error (SQLSTATE codes) into a normalized Athenna
   * constraint violation exception.
   *
   * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
   */
  public parseError(error: any) {
    const code = error?.code

    if (!code) {
      return null
    }

    const table = error.table
    const driver = 'postgres'

    /**
     * Both unique and foreign key violations expose the offending columns in
     * the `detail` field, e.g. `Key (avatar_id, section_id)=(...) already
     * exists.`
     */
    const columnsFromDetail = () => {
      const match = /\(([^)]+)\)=/.exec(error.detail ?? '')

      if (!match) {
        return undefined
      }

      return match[1].split(',').map(column => column.trim())
    }

    switch (code) {
      case '23505':
        return new UniqueViolationException({
          table,
          constraint: error.constraint,
          columns: columnsFromDetail(),
          driver,
          raw: error
        })
      case '23502':
        return new NotNullViolationException({
          table,
          column: error.column,
          driver,
          raw: error
        })
      case '23503':
        return new ForeignKeyViolationException({
          table,
          constraint: error.constraint,
          column: columnsFromDetail()?.[0],
          driver,
          raw: error
        })
      case '23514':
        return new CheckViolationException({
          table,
          constraint: error.constraint,
          driver,
          raw: error
        })
      default:
        return null
    }
  }
}
