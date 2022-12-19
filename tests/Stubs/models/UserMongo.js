import { Model, Column, Relation } from '#src/index'
import { ProductMongo } from '#tests/Stubs/models/ProductMongo'

export class UserMongo extends Model {
  /**
   * Set the primary key of your model.
   *
   * @return {string}
   */
  static get primaryKey() {
    return 'id'
  }

  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mongo'
  }

  /**
   * Set the table name of this model instance.
   *
   * @return {string}
   */
  static get table() {
    return 'users'
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name', 'email']
  }

  /**
   * Return a boolean specifying if Model will use soft delete.
   *
   *  @return {boolean}
   */
  static get isSoftDelete() {
    return true
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    return {
      id: Column.autoIncrementedObjectId('_id'),
      name: Column.string('name', 200),
      email: Column.string({ isHidden: true, isUnique: true }),
      products: Relation.hasMany(ProductMongo, 'user', true),
      createdAt: Column.createdAt(),
      updatedAt: Column.updatedAt(),
      deletedAt: Column.deletedAt(this.DELETED_AT),
    }
  }

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static async definition() {
    return {
      id: this.faker.datatype.number(),
      name: this.faker.name.fullName(),
      email: this.faker.internet.email(),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }
}
