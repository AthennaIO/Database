/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Model } from '#src/models/Model'
import { Test, type Context } from '@athenna/test'
import { Annotation } from '#src/helpers/Annotation'
import { HasOne } from '#src/models/annotations/HasOne'
import { Column } from '#src/models/annotations/Column'

export default class HasOneTest {
  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotation({ assert }: Context) {
    class Profile extends Model {}

    class User extends Model {
      @Column({ isMainPrimary: true })
      public id: string

      @HasOne(Profile)
      public profile: Profile
    }

    assert.deepEqual(Annotation.getHasOnesMeta(User), [
      {
        property: 'profile',
        isIncluded: false,
        model: Profile,
        primaryKey: 'id',
        foreignKey: 'userId',
        type: 'hasOne'
      }
    ])
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithHasOneAnnotationWithCustomValue({ assert }: Context) {
    class Profile extends Model {}

    class User extends Model {
      @Column({ isMainPrimary: true })
      public id: string

      @HasOne(Profile, { isIncluded: true, foreignKey: 'userIdReference', primaryKey: 'other' })
      public profile: Profile
    }

    assert.deepEqual(Annotation.getHasOnesMeta(User), [
      {
        property: 'profile',
        isIncluded: true,
        model: Profile,
        primaryKey: 'other',
        foreignKey: 'userIdReference',
        type: 'hasOne'
      }
    ])
  }

  @Test()
  public async shouldNotBeAbleToChangeClassPropertyEvenBypassingTypeScript({ assert }: Context) {
    class Profile extends Model {}

    class User extends Model {
      @Column({ isMainPrimary: true })
      public id: string

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @HasOne(Profile, { property: 'otherProfile' })
      public profile: Profile
    }

    assert.deepEqual(Annotation.getHasOnesMeta(User), [
      {
        property: 'profile',
        isIncluded: false,
        model: Profile,
        primaryKey: 'id',
        foreignKey: 'userId',
        type: 'hasOne'
      }
    ])
  }
}
