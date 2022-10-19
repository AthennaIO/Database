/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { test } from '@japa/runner'
import { Config, Folder, Path } from '@secjs/utils'

import { DB } from '#src/index'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'
import { Course } from '#tests/Stubs/models/Course'
import { Student } from '#tests/Stubs/models/Student'

test.group('StudentModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await new Config().safeLoad(Path.config('database.js'))
    await new Config().safeLoad(Path.config('logging.js'))
  })

  group.each.setup(async () => {
    new LoggerProvider().register()
    await new DatabaseProvider().boot()

    await DB.connection('mysql').connect()
    await DB.connection('mysql').runMigrations()

    await Course.factory().count(10).create()
    await Student.factory().count(10).create()
  })

  group.each.teardown(async () => {
    await DB.connection('mysql').revertMigrations()
    await DB.connection('mysql').close()
  })

  group.teardown(async () => {
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.database())
  })

  test('should be able to enroll many to many relations', async ({ assert }) => {
    const student = await Student.find()
    const course = await Course.find()

    student.courses = [course]

    await student.save()

    assert.equal(course.id, student.$extras[0].courseId)
    assert.equal(student.id, student.$extras[0].studentId)
    assert.deepEqual(student.$extras, await DB.connection('mysql').table('students_courses').findMany())
  })

  test('should be able to load courses relation of student', async ({ assert }) => {
    const student = await Student.find()
    const course = await Course.find()

    student.courses = [course]

    await student.save()

    const studentWithCourses = await Student.query().where('id', student.id).includes('courses').find()

    assert.isDefined(studentWithCourses.$extras[0].id)
    assert.equal(studentWithCourses.$extras[0].studentId, student.id)
    assert.equal(studentWithCourses.$extras[0].courseId, course.id)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const student = await Student.find()
    const course = await Course.find()
    const otherCourse = await Course.find()

    student.courses = [course, otherCourse]

    await student.save()

    const studentWithCourses = await Student.query()
      .where('id', student.id)
      .includes('courses', query => query.where('id', course.id))
      .find()

    assert.isDefined(studentWithCourses.$extras[0].id)
    assert.equal(studentWithCourses.courses[0].id, course.id)
    assert.equal(studentWithCourses.$extras[0].courseId, course.id)
    assert.equal(studentWithCourses.$extras[0].studentId, student.id)

    assert.lengthOf(studentWithCourses.$extras, 2)
    assert.lengthOf(studentWithCourses.courses, 1)
  })
})
