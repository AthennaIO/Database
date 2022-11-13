/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Folder, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'

import { DB } from '#src/index'
import { Course } from '#tests/Stubs/models/Course'
import { Student } from '#tests/Stubs/models/Student'
import { DatabaseProvider } from '#src/Providers/DatabaseProvider'

test.group('StudentModelTest', group => {
  group.setup(async () => {
    await new Folder(Path.stubs('configs')).copy(Path.config())
    await new Folder(Path.stubs('database')).copy(Path.database())
    await Config.safeLoad(Path.config('database.js'))
    await Config.safeLoad(Path.config('logging.js'))
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

    assert.isDefined(student.courses[0].pivot.id)
    assert.equal(course.id, student.courses[0].pivot.courseId)
    assert.equal(student.id, student.courses[0].pivot.studentId)
    assert.deepEqual(
      student.courses[0].pivot,
      await DB.connection('mysql').table('students_courses').where('id', student.courses[0].pivot.id).find(),
    )
  })

  test('should be able to load courses relation of student', async ({ assert }) => {
    const student = await Student.find()
    const course = await Course.find()

    student.courses = [course]

    await student.save()

    const studentWithCourses = await Student.query().where('id', student.id).with('courses').find()

    assert.isDefined(studentWithCourses.courses[0].pivot.id)
    assert.equal(studentWithCourses.courses[0].pivot.studentId, student.id)
    assert.equal(studentWithCourses.courses[0].pivot.courseId, course.id)
  })

  test('should be able to make sub queries on relations', async ({ assert }) => {
    const student = await Student.find()
    const course = await Course.find()
    const otherCourse = await Course.find()

    student.courses = [course, otherCourse]

    await student.save()

    const studentWithCourses = await Student.query()
      .where('id', student.id)
      .with('courses', query => query.where('id', course.id))
      .find()

    assert.isDefined(studentWithCourses.courses[0].pivot.id)
    assert.equal(studentWithCourses.courses[0].id, course.id)
    assert.equal(studentWithCourses.courses[0].pivot.courseId, course.id)
    assert.equal(studentWithCourses.courses[0].pivot.studentId, student.id)

    assert.lengthOf(studentWithCourses.courses, 1)
  })
})
