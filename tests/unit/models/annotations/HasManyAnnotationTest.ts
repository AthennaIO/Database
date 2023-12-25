/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel } from '#src/models/BaseModel'
import { Annotation } from '#src/helpers/Annotation'
import { Column } from '#src/models/annotations/Column'
import { HasMany } from '#src/models/annotations/HasMany'
import { Test, AfterEach, type Context } from '@athenna/test'

export default class HasManyAnnotationTest {
  @AfterEach()
  public afterEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasManyAnnotation({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @HasMany(() => Profile)
      public profile: Profile
    }

    const [meta] = Annotation.getHasManyMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasMany')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasManyAnnotationWithCustomValue({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @HasMany(() => Profile, { isIncluded: true, foreignKey: 'userIdReference', primaryKey: 'other' })
      public profile: Profile
    }

    const [meta] = Annotation.getHasManyMeta(User)

    assert.isTrue(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasMany')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'other')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userIdReference')
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotationUsingModelAsString({ assert }: Context) {
    class Profile extends BaseModel {}

    ioc.singleton('App/Models/Profile', Profile)

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @HasMany('Profile')
      public profile: Profile
    }

    const [meta] = Annotation.getHasManyMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasMany')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }

  @Test()
  public async shouldNotBeAbleToChangeClassPropertyEvenBypassingTypeScript({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @HasMany(() => Profile, { property: 'otherProfile' })
      public profile: Profile
    }

    const [meta] = Annotation.getHasManyMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasMany')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }
}
