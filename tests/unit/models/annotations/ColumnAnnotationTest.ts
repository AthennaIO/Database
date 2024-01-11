/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Schema } from 'mongoose'
import { BaseModel } from '#src/models/BaseModel'
import { Test, type Context } from '@athenna/test'
import { Annotation } from '#src/helpers/Annotation'
import { Column } from '#src/models/annotations/Column'

export default class ColumnAnnotationTest {
  @Test()
  public async shouldBeAbleToDefinePropertyWithColumnAnnotation({ assert }: Context) {
    class User extends BaseModel {
      @Column()
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
        hasSetName: false,
        defaultTo: null,
        type: String,
        isIndex: false,
        isSparse: false,
        isPrimary: false,
        isHidden: false,
        isUnique: false,
        isNullable: true,
        isMainPrimary: false,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }

  @Test()
  public async shouldNotDefineNameAsUnderlineIdIfHasBeenDefinedByClient({ assert }: Context) {
    class User extends BaseModel {
      public static connection() {
        return 'mongo'
      }

      @Column({ name: 'id' })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
        hasSetName: true,
        defaultTo: null,
        type: String,
        isIndex: false,
        isSparse: false,
        isPrimary: false,
        isHidden: false,
        isUnique: false,
        isNullable: true,
        isMainPrimary: false,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithColumnAnnotationWithCustomValue({ assert }: Context) {
    class User extends BaseModel {
      @Column({
        name: '_id',
        defaultTo: '1',
        type: Schema.ObjectId,
        isPrimary: true,
        isHidden: false,
        isUnique: false,
        isNullable: false,
        isIndex: false,
        isSparse: false,
        isMainPrimary: false,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        persist: true
      })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: '_id',
        hasSetName: true,
        type: Schema.ObjectId,
        defaultTo: '1',
        isPrimary: true,
        isHidden: false,
        isUnique: false,
        isNullable: false,
        isIndex: false,
        isSparse: false,
        isMainPrimary: false,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }

  @Test()
  public async shouldNotBeAbleToChangeClassPropertyEvenBypassingTypeScript({ assert }: Context) {
    class User extends BaseModel {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @Column({ property: 'other' })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
        hasSetName: false,
        defaultTo: null,
        type: String,
        isPrimary: false,
        isHidden: false,
        isUnique: false,
        isNullable: true,
        isIndex: false,
        isSparse: false,
        isMainPrimary: false,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }

  @Test()
  public async shouldBeAbleToDefinePropertyWithColumnAnnotationAsTheMainPrimary({ assert }: Context) {
    class User extends BaseModel {
      @Column({ isMainPrimary: true })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
        hasSetName: false,
        defaultTo: null,
        type: String,
        isPrimary: true,
        isHidden: false,
        isUnique: false,
        isNullable: true,
        isIndex: false,
        isSparse: false,
        isMainPrimary: true,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }

  @Test()
  public async shouldForceToSetColumnAsPrimaryKeyWhenIsMainPrimaryIsSetToTrue({ assert }: Context) {
    class User extends BaseModel {
      @Column({ isPrimary: false, isMainPrimary: true })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
        hasSetName: false,
        type: String,
        defaultTo: null,
        isPrimary: true,
        isHidden: false,
        isUnique: false,
        isNullable: true,
        isIndex: false,
        isSparse: false,
        isMainPrimary: true,
        isCreateDate: false,
        isUpdateDate: false,
        isDeleteDate: false,
        property: 'id',
        persist: true
      }
    ])
  }
}
