/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { String } from '@athenna/common'
import type { BaseModel } from '#src/models/BaseModel'
import type { HasManyThroughOptions } from '#src/types'
import type { Driver } from '#src/database/drivers/Driver'

export class HasManyThroughRelation {
  /**
   * Get the options with defined default values.
   */
  public static options(
    Parent: typeof BaseModel,
    relation: HasManyThroughOptions
  ): HasManyThroughOptions {
    const Through = relation.through()
    const Final = relation.model()

    relation.localKey =
      relation.localKey || Parent.schema().getMainPrimaryKeyProperty()
    relation.firstKey =
      relation.firstKey || `${String.toCamelCase(Parent.name)}Id`

    if (relation.inverse) {
      relation.secondLocalKey =
        relation.secondLocalKey || `${String.toCamelCase(Final.name)}Id`
      relation.secondKey =
        relation.secondKey || Final.schema().getMainPrimaryKeyProperty()
    } else {
      relation.secondLocalKey =
        relation.secondLocalKey || Through.schema().getMainPrimaryKeyProperty()
      relation.secondKey =
        relation.secondKey || `${String.toCamelCase(Through.name)}Id`
    }

    return relation
  }

  /**
   * Load a has many through relation.
   */
  public static async load(
    model: BaseModel,
    relation: HasManyThroughOptions
  ): Promise<any> {
    this.options(model.constructor as typeof BaseModel, relation)

    const throughRows = await relation
      .through()
      .query()
      .where(relation.firstKey as never, model[relation.localKey])
      .findMany()

    const linkValues = throughRows
      .map(r => r[relation.secondLocalKey])
      .filter(v => v !== undefined && v !== null)

    if (!linkValues.length) {
      model[relation.property] = []

      return model
    }

    model[relation.property] = await relation
      .model()
      .query()
      .whereIn(relation.secondKey as never, linkValues)
      .when(relation.withClosure, relation.withClosure)
      .findMany()

    return model
  }

  /**
   * Load all models that has many through relation.
   */
  public static async loadAll(
    models: BaseModel[],
    relation: HasManyThroughOptions
  ): Promise<any[]> {
    if (!models.length) {
      return models
    }

    this.options(models[0].constructor as typeof BaseModel, relation)

    const Final = relation.model()
    const finalPK = Final.schema().getMainPrimaryKeyProperty()

    const parentValues = models.map(m => m[relation.localKey])
    const throughRows = await relation
      .through()
      .query()
      .whereIn(relation.firstKey as never, parentValues)
      .findMany()

    const parentToLinks = new Map<any, any[]>()
    const allLinks: any[] = []

    for (const t of throughRows) {
      const link = t[relation.secondLocalKey]

      if (link === undefined || link === null) {
        continue
      }

      allLinks.push(link)

      const arr = parentToLinks.get(t[relation.firstKey]) || []

      arr.push(link)
      parentToLinks.set(t[relation.firstKey], arr)
    }

    const finals = allLinks.length
      ? await relation
          .model()
          .query()
          .whereIn(relation.secondKey as never, allLinks)
          .when(relation.withClosure, relation.withClosure)
          .findMany()
      : []

    const linkToFinals = new Map<any, any[]>()

    for (const f of finals) {
      const arr = linkToFinals.get(f[relation.secondKey]) || []

      arr.push(f)
      linkToFinals.set(f[relation.secondKey], arr)
    }

    return models.map(m => {
      const links = parentToLinks.get(m[relation.localKey]) || []
      const collected: any[] = []
      const seen = new Set()

      for (const link of links) {
        const matches = linkToFinals.get(link) || []

        for (const f of matches) {
          const pk = f[finalPK]

          if (seen.has(pk)) {
            continue
          }

          seen.add(pk)
          collected.push(f)
        }
      }

      m[relation.property] = collected

      return m
    })
  }

  /**
   * Apply a where has relation to the query when the given model
   * has many through relations.
   */
  public static whereHas(
    Model: typeof BaseModel,
    query: Driver,
    relation: HasManyThroughOptions
  ) {
    this.options(Model, relation)

    const Through = relation.through()
    const Final = relation.model()

    const modelTable = Model.table()
    const throughTable = Through.table()
    const finalTable = Final.table()

    const modelLocal =
      Model.schema().getColumnNameByProperty(relation.localKey) ||
      Model.schema().getMainPrimaryKeyName()
    const throughFK =
      Through.schema().getColumnNameByProperty(relation.firstKey) ||
      Through.schema().getColumnNameByProperty(
        `${String.toCamelCase(Model.name)}Id`
      )
    const throughLink = Through.schema().getColumnNameByProperty(
      relation.secondLocalKey
    )
    const finalLink = Final.schema().getColumnNameByProperty(relation.secondKey)

    let outerWhereRaw = `${throughTable}.${throughFK} = ${modelTable}.${modelLocal}`

    switch (Through.schema().getModelDriverName()) {
      case 'sqlite':
      case 'postgres':
        outerWhereRaw = `"${throughTable}"."${throughFK}" = "${modelTable}"."${modelLocal}"`
    }

    Through.query()
      .setDriver(query, throughTable)
      .whereRaw(outerWhereRaw)
      .whereExists(innerQuery => {
        let innerWhereRaw = `${finalTable}.${finalLink} = ${throughTable}.${throughLink}`

        switch (Final.schema().getModelDriverName()) {
          case 'sqlite':
          case 'postgres':
            innerWhereRaw = `"${finalTable}"."${finalLink}" = "${throughTable}"."${throughLink}"`
        }

        Final.query()
          .setDriver(innerQuery, finalTable)
          .whereRaw(innerWhereRaw)
          .when(relation.closure, relation.closure)
      })
  }
}
