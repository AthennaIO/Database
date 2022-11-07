import { Model, Column, Relation } from '#src/index'
import { Course } from '#tests/Stubs/models/Course'

export class Student extends Model {
  /**
   * Set the db connection that this model instance will work with.
   *
   * @return {string}
   */
  static get connection() {
    return 'mysql'
  }

  /**
   * The attributes that could be persisted in database.
   *
   *  @return {string[]}
   */
  static get persistOnly() {
    return ['id', 'name']
  }

  /**
   * The default schema for model instances.
   *
   * @return {any}
   */
  static schema() {
    return {
      id: Column.autoIncrementedUuid('id'),
      name: Column.string('name', 200),
      courses: Relation.manyToMany(Course, 'students'),
    }
  }

  /**
   * The definition method used by factories.
   *
   * @return {any}
   */
  static async definition() {
    return {
      id: this.faker.datatype.uuid(),
      name: this.faker.name.fullName(),
    }
  }
}
