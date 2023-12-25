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
import { HasOne } from '#src/models/annotations/HasOne'
import { Column } from '#src/models/annotations/Column'
import { Test, AfterEach, type Context } from '@athenna/test'

export default class HasOneAnnotationTest {
  @AfterEach()
  public afterEach() {
    ioc.reconstruct()
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotation({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @HasOne(() => Profile)
      public profile: Profile
    }

    const [meta] = Annotation.getHasOnesMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasOne')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotationWithCustomValue({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @HasOne(() => Profile, { isIncluded: true, foreignKey: 'userIdReference', primaryKey: 'other' })
      public profile: Profile
    }

    const [meta] = Annotation.getHasOnesMeta(User)

    assert.isTrue(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasOne')
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

      @HasOne('Profile')
      public profile: Profile
    }

    const [meta] = Annotation.getHasOnesMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasOne')
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
      @HasOne(() => Profile, { property: 'otherProfile' })
      public profile: Profile
    }

    const [meta] = Annotation.getHasOnesMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.deepEqual(meta.type, 'hasOne')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.primaryKey, 'id')
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.foreignKey, 'userId')
  }
}
