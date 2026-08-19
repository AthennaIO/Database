/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseModel } from '#src/models/BaseModel'
import { Column } from '#src/models/annotations/Column'
import {
  BeforeCreate,
  AfterCreate,
  BeforeUpdate,
  AfterUpdate,
  BeforeSave,
  AfterSave,
  BeforeDelete,
  AfterDelete,
  BeforeFind,
  AfterFind
} from '#src/models/annotations/Hooks'

export class UserHooked extends BaseModel {
  public static connection() {
    return 'fake'
  }

  public static table() {
    return 'users'
  }

  /**
   * Recorded hook firings so tests can assert order and payloads.
   */
  public static events: { type: string; payload: any }[] = []

  @Column()
  public id: string

  @Column()
  public name: string

  @Column({ isCreateDate: true, name: 'created_at' })
  public createdAt: Date

  @Column({ isUpdateDate: true, name: 'updated_at' })
  public updatedAt: Date

  @Column({ isDeleteDate: true, name: 'deleted_at' })
  public deletedAt: Date

  @BeforeCreate()
  public static beforeCreateHook(payload: any) {
    this.events.push({ type: 'beforeCreate', payload })
  }

  @AfterCreate()
  public static afterCreateHook(payload: any) {
    this.events.push({ type: 'afterCreate', payload })
  }

  @BeforeUpdate()
  public static beforeUpdateHook(payload: any) {
    this.events.push({ type: 'beforeUpdate', payload })
  }

  @AfterUpdate()
  public static afterUpdateHook(payload: any) {
    this.events.push({ type: 'afterUpdate', payload })
  }

  @BeforeSave()
  public static beforeSaveHook(payload: any) {
    this.events.push({ type: 'beforeSave', payload })
  }

  @AfterSave()
  public static afterSaveHook(payload: any) {
    this.events.push({ type: 'afterSave', payload })
  }

  @BeforeDelete()
  public static beforeDeleteHook(payload: any) {
    this.events.push({ type: 'beforeDelete', payload })
  }

  @AfterDelete()
  public static afterDeleteHook(payload: any) {
    this.events.push({ type: 'afterDelete', payload })
  }

  @BeforeFind()
  public static beforeFindHook(payload: any) {
    this.events.push({ type: 'beforeFind', payload })
  }

  @AfterFind()
  public static afterFindHook(payload: any) {
    this.events.push({ type: 'afterFind', payload })
  }
}
