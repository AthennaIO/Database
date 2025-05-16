/**
 * @athenna/database
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Database } from '#src/facades/Database'
import { Course } from '#tests/fixtures/models/e2e/Course'
import { Student } from '#tests/fixtures/models/e2e/Student'
import { DatabaseProvider } from '#src/providers/DatabaseProvider'
import { StudentsCourses } from '#tests/fixtures/models/e2e/StudentsCourses'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class BelongsToManyRelationTest {
  @BeforeEach()
  public async beforeEach() {
    await Config.loadAll(Path.fixtures('config'))

    new DatabaseProvider().register()

    ioc.transient('App/Models/Course', Course)
    ioc.transient('App/Models/Student', Student)
    ioc.transient('App/Models/StudentsCourses', StudentsCourses)

    const pg = Database.connection('postgres-docker')

    Mock.when(Path, 'migrations').return(Path.fixtures('migrations'))

    await pg.revertMigrations()
    await pg.runMigrations()

    await pg.table('students').create({ id: 1, name: 'lenon' })
    await pg.table('courses').create({ id: 1, name: 'Math' })
    await pg.table('students_courses').create({ id: 1, studentId: 1, courseId: 1 })
  }

  @AfterEach()
  public async afterEach() {
    const pg = Database.connection('postgres-docker')

    await pg.revertMigrations()

    await Database.closeAll()
    Config.clear()
    ioc.reconstruct()
    Mock.restoreAll()
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOne({ assert }: Context) {
    const course = await Course.query().with('students').find()

    assert.instanceOf(course, Course)
    assert.instanceOf(course.students[0], Student)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndWhereHas({ assert }: Context) {
    const course = await Course.query()
      .whereHas('students', query => query.where('id', 1))
      .find()

    assert.instanceOf(course, Course)
    assert.instanceOf(course.students[0], Student)
  }

  @Test()
  public async shouldBeAbleToNotLoadOneRelationUsingFindOneIfRelationIsNotPresent({ assert }: Context) {
    const course = await Course.query()
      .whereHas('students', query => query.where('id', 99))
      .find()

    assert.isUndefined(course)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const course = await Course.query()
      .select('id', 'name')
      .with('students', query => query.select('id'))
      .find()

    assert.instanceOf(course, Course)
    assert.instanceOf(course.students[0], Student)
    assert.deepEqual(course, {
      id: 1,
      name: 'Math',
      students: [{ id: 1, original: { id: 1 } }],
      original: { id: 1, name: 'Math' }
    })
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindMany({ assert }: Context) {
    const courses = await Course.query().with('students').findMany()

    assert.instanceOf(courses[0], Course)
    assert.instanceOf(courses[0].students[0], Student)
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndWhereHas({ assert }: Context) {
    const courses = await Course.query()
      .whereHas('students', query => query.where('id', 1))
      .findMany()

    assert.instanceOf(courses[0], Course)
    assert.instanceOf(courses[0].students[0], Student)
  }

  @Test()
  public async shouldBeAbleToNotLoadOneRelationUsingFindManyAndWhereHasIfRelationIsNotPresent({ assert }: Context) {
    const courses = await Course.query()
      .whereHas('students', query => query.where('id', 99))
      .findMany()

    assert.isUndefined(courses[0])
  }

  @Test()
  public async shouldBeAbleToLoadOneRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const courses = await Course.query()
      .select('id', 'name')
      .with('students', query => query.select('id'))
      .findMany()

    assert.instanceOf(courses[0], Course)
    assert.instanceOf(courses[0].students[0], Student)
    assert.deepEqual(courses, [
      {
        id: 1,
        name: 'Math',
        students: [{ id: 1, original: { id: 1 } }],
        original: { id: 1, name: 'Math' }
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindOne({ assert }: Context) {
    const student = await Student.query().with('courses').find()

    assert.instanceOf(student, Student)
    assert.instanceOf(student.courses[0], Course)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindOneAndWhereHas({ assert }: Context) {
    const student = await Student.query()
      .whereHas('courses', query => query.where('id', 1))
      .find()

    assert.instanceOf(student, Student)
    assert.instanceOf(student.courses[0], Course)
  }

  @Test()
  public async shouldBeAbleToNotLoadOppositeRelationUsingFindOneAndWhereHasIfRelationIsNotPresent({ assert }: Context) {
    const student = await Student.query()
      .whereHas('courses', query => query.where('id', 99))
      .find()

    assert.isUndefined(student)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindOneAndExecuteClosure({ assert }: Context) {
    const student = await Student.query()
      .select('id', 'name')
      .with('courses', query => query.select('id'))
      .find()

    assert.instanceOf(student, Student)
    assert.instanceOf(student.courses[0], Course)
    assert.deepEqual(student, {
      id: 1,
      name: 'lenon',
      courses: [{ id: 1, original: { id: 1 } }],
      original: { id: 1, name: 'lenon' }
    })
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindMany({ assert }: Context) {
    const students = await Student.query().with('courses').findMany()

    assert.instanceOf(students[0], Student)
    assert.instanceOf(students[0].courses[0], Course)
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindManyAndWhereHas({ assert }: Context) {
    const students = await Student.query()
      .whereHas('courses', query => query.where('id', 1))
      .findMany()

    assert.instanceOf(students[0], Student)
    assert.instanceOf(students[0].courses[0], Course)
  }

  @Test()
  public async shouldBeAbleToNotLoadOppositeRelationUsingFindManyAndWhereHasIfRelationIsNotPresent({
    assert
  }: Context) {
    const students = await Student.query()
      .whereHas('courses', query => query.where('id', 99))
      .findMany()

    assert.isUndefined(students[0])
  }

  @Test()
  public async shouldBeAbleToLoadOppositeRelationUsingFindManyAndExecuteClosure({ assert }: Context) {
    const students = await Student.query()
      .select('id', 'name')
      .with('courses', query => query.select('id'))
      .findMany()

    assert.instanceOf(students[0], Student)
    assert.instanceOf(students[0].courses[0], Course)
    assert.deepEqual(students, [
      {
        id: 1,
        name: 'lenon',
        courses: [{ id: 1, original: { id: 1 } }],
        original: { id: 1, name: 'lenon' }
      }
    ])
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveRelationUsingFindOne({ assert }: Context) {
    await Course.create({ id: 2, name: 'Japanese' })
    const course = await Course.query().with('students').where('id', 2).find()

    assert.instanceOf(course, Course)
    assert.isEmpty(course.students)
  }

  @Test()
  public async shouldBeAbleToLoadModelsThatDontHaveRelationUsingFindMany({ assert }: Context) {
    await Course.create({ id: 2, name: 'Japanese' })
    const courses = await Course.query().with('students').orderBy('name').findMany()

    assert.instanceOf(courses[0], Course)
    assert.instanceOf(courses[1], Course)
    assert.isEmpty(courses[0].students)
    assert.instanceOf(courses[1].students[0], Student)
  }
}
