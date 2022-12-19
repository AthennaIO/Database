import { Model, Column, Relation } from '#src/index'
import { ProductMongo } from '#tests/Stubs/models/ProductMongo'

export class ProductDetailMongo extends Model {
  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mongo'
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
      content: Column.string('content', 200),
      productId: Column.integer(),
      product: Relation.belongsTo(ProductDetailMongo, 'productDetails'),
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
      content: this.faker.name.fullName(),
      productId: ProductMongo.factory('id'),
      createdAt: this.faker.date.recent(),
      updatedAt: this.faker.date.recent(),
      deletedAt: null,
    }
  }
}
