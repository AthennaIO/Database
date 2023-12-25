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
import { BelongsTo } from '#src/models/annotations/BelongsTo'
import { Test, AfterEach, type Context } from '@athenna/test'

export default class BelongsToAnnotationTest {
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

      @BelongsTo(() => Profile)
      public profile: Profile
    }

    const [meta] = Annotation.getBelongsToMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.isUndefined(meta.primaryKey)
    assert.isUndefined(meta.foreignKey)
    assert.deepEqual(meta.type, 'belongsTo')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.property, 'profile')
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasManyAnnotationWithCustomValue({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @BelongsTo(() => Profile, { isIncluded: true, foreignKey: 'userIdReference', primaryKey: 'other' })
      public profile: Profile
    }

    const [meta] = Annotation.getBelongsToMeta(User)

    assert.isTrue(meta.isIncluded)
    assert.deepEqual(meta.type, 'belongsTo')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.property, 'profile')
    assert.deepEqual(meta.primaryKey, 'other')
    assert.deepEqual(meta.foreignKey, 'userIdReference')
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotationUsingModelAsString({ assert }: Context) {
    class Profile extends BaseModel {}

    ioc.singleton('App/Models/Profile', Profile)

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      @BelongsTo('Profile')
      public profile: Profile
    }

    const [meta] = Annotation.getBelongsToMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.isUndefined(meta.primaryKey)
    assert.isUndefined(meta.foreignKey)
    assert.deepEqual(meta.type, 'belongsTo')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.property, 'profile')
  }

  @Test()
  public async shouldNotBeAbleToChangeClassPropertyEvenBypassingTypeScript({ assert }: Context) {
    class Profile extends BaseModel {}

    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @BelongsTo(() => Profile, { property: 'otherProfile' })
      public profile: Profile
    }

    const [meta] = Annotation.getBelongsToMeta(User)

    assert.isFalse(meta.isIncluded)
    assert.isUndefined(meta.primaryKey)
    assert.isUndefined(meta.foreignKey)
    assert.deepEqual(meta.type, 'belongsTo')
    assert.deepEqual(meta.model(), Profile)
    assert.deepEqual(meta.property, 'profile')
  }
}
