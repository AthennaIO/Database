/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { Column } from '#src/models/annotations/Column'
import { ModelSchema } from '#src/models/schemas/ModelSchema'

export default class ModelSchemaTest {
  @Test()
  public async shouldBeAbleToGetModelColumnByProperty({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByProperty('id')

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isNullable: true,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: 'id',
      property: 'id'
    })
  }

  @Test()
  public async shouldReturnUndefinedWhenSearchingByPropertyAndDoesNotExist({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByProperty('not-found')

    assert.isUndefined(column)
  }

  @Test()
  public async shouldBeAbleToGetModelColumnByDatabaseColumnName({ assert }: Context) {
    class User {
      @Column({ name: '_id' })
      public id: string
    }

    const column = new ModelSchema(User).getColumnByName('_id')

    assert.deepEqual(column, {
      defaultTo: null,
      isCreateDate: false,
      isDeleteDate: false,
      isHidden: false,
      isNullable: true,
      isPrimary: false,
      isUnique: false,
      isUpdateDate: false,
      name: '_id',
      property: 'id'
    })
  }

  @Test()
  public async shouldReturnUndefinedWhenSearchingByDatabaseColumnNameAndDoesNotExist({ assert }: Context) {
    class User {
      @Column()
      public id: string
    }

    const column = new ModelSchema(User).getColumnByName('not-found')

    assert.isUndefined(column)
  }
}
