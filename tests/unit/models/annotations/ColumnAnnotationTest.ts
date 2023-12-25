/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Schema } from 'mongoose'
import { Test, type Context } from '@athenna/test'
import { Annotation } from '#src/helpers/Annotation'
import { Column } from '#src/models/annotations/Column'

export default class ColumnAnnotationTest {
  @Test()
  public async shouldBeAbleToDefinePropertyWithColumnAnnotation({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
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
    class User {
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
    class User {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      @Column({ property: 'other' })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
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
    class User {
      @Column({ isMainPrimary: true })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
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
    class User {
      @Column({ isPrimary: false, isMainPrimary: true })
      public id: string
    }

    assert.deepEqual(Annotation.getColumnsMeta(User), [
      {
        name: 'id',
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
