import { defineStore } from 'pinia'
import { useSemesterStore } from './semester'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    courses: [],

    selectedCourse: null,
    selectedSession: null,

    showCourseBox: [],

    // drag and drop of calendar elements
    dragType: null,
    startClientX: null,
    startClientY: null,
    startWeekday: null,
    startSessionStart: null,
    startSessionEnd: null,
  }),

  actions: {
    getNewCourse() {
      const semesterStore = useSemesterStore()
      let quarters = new Array()
      for (let i = 0; i < semesterStore.quarters.length; i++) {
        quarters.push(i)
      }
      return {
        title: '',
        instructor: '',
        quarters,
        sessions: [],
        exams: [],
      }
    },

    getNewSession(weekday, start, end) {
      return {
        weekday: weekday,
        start: start,
        end: end,
        location: '',
        note: '',
        freq: { type: 0 },
      }
    },

    getNewExam() {
      return {
        date: '',
        start: '',
        end: '',
        location: '',
      }
    },

    addCourse(newCourse = null) {
      newCourse = newCourse || this.getNewCourse()
      this.courses.push(newCourse)
      this.select(newCourse, null)
      return newCourse
    },

    addSessionToCourse(course, weekday, start, end) {
      course = course || this.selectedCourse
      course?.sessions.push(this.getNewSession(weekday, start, end))
    },

    addSessionToSelectedCourse(weekday, start, end) {
      this.addSectionToCourse(this.selectedCourse, weekday, start, end)
    },

    addExamToCourse(course) {
      course = course || this.selectedCourse
      course?.exams.push(this.getNewExam())
    },

    addExamToSelectedCourse() {
      this.addExamToCourse(this.selectedCourse)
    },

    deleteSessionFromCourse(session, course) {
      course = course || this.selectedCourse
      if (course) {
        course.sessions = course.sessions.filter((s) => s !== session)
        if (this.selectedSession === session) {
          this.selectedSession = null
        }
      }
    },

    deleteSessionFromSelectedCourse(session) {
      this.deleteSessionFromCourse(this.selectedCourse, session)
    },

    deleteExamFromCourse(exam, course) {
      course = course || this.selectedCourse
      if (course) {
        course.exams = course.exams.filter((e) => e !== exam)
      }
    },

    deleteExamFromSelectedCourse(exam) {
      this.deleteExamFromCourse(this.selectedCourse, exam)
    },

    deleteCourse(course) {
      course = course || this.selectedCourse
      if (course) {
        this.courses = this.courses.filter((c) => c !== course)
        if (this.selectedCourse === course) {
          this.selectedCourse = null
          this.selectedSession = null
        }
      }
    },

    deleteSelectedCourse() {
      if (this.selectedCourse) {
        this.courses = this.courses.filter((c) => c !== this.selectedCourse)
        this.selectedCourse = null
        this.selectedSession = null
      }
    },

    // check whether this course is displayed on the calendar, i.e. at least
    // one session is valid.
    isDisplayed(course) {
      for (const session of course.sessions) {
        if (session.start && session.end && session.weekday) {
          return true
        }
      }
      return false
    },

    select(course, session) {
      this.selectedCourse = course
      this.selectedSession = session
    },

    save() {
      localStorage.setItem('schedule', JSON.stringify(this.courses))
    },

    load() {
      const version = localStorage.getItem('version')
      const courses = localStorage.getItem('schedule')
      if (!courses) return

      if (!version) {
        // version <0.2
        for (let course of courses) {
          course.quarters = new Array()
          for (let i = course.quarterStart; i <= course.quarterEnd; i++) {
            course.quarters.push(i)
          }
          delete course.quarterStart
          delete course.quarterEnd

          course.sessions = course.sections
          delete course.sections

          for (let session of course.sessions) {
            session.freq = { type: 0 }
          }

          for (let exam of course.exams) {
            exam.date = exam.start.split('T')[0]
            exam.start = exam.start.split('T')[1]
            exam.end = exam.end.split('T')[1]
          }
        }
      }

      this.courses = JSON.parse(courses)
    },

    reset() {
      this.courses = [
        {
          title: '????????????',
          instructor: '?????? ??????',
          quarters: [0, 1],
          sessions: [
            { weekday: 1, start: 6, end: 8, location: '??????-103', note: '', freq: { type: 0 } },
          ],
          exams: [{ date: '2022-06-21', start: '08:00', end: '10:00', location: '' }],
        },
        {
          title: '?????????(?????????)',
          instructor: '?????????',
          quarters: [0, 1],
          sessions: [
            {
              weekday: 2,
              start: 1,
              end: 2,
              location: '?????????????????????',
              note: '',
              freq: { type: 0 },
            },
          ],
          exams: [],
        },
        {
          title: '???????????????????????????????????????',
          instructor: '?????????',
          quarters: [0],
          sessions: [
            { weekday: 1, start: 3, end: 4, location: '??????-104', note: '', freq: { type: 0 } },
            { weekday: 4, start: 3, end: 4, location: '??????-104', note: '', freq: { type: 0 } },
          ],
          exams: [],
        },
        {
          title: '???????????????????????????',
          instructor: '??????',
          quarters: [0],
          sessions: [
            { weekday: 1, start: 9, end: 10, location: '??????-103', note: '', freq: { type: 0 } },
            { weekday: 2, start: 7, end: 8, location: '??????-503', note: '', freq: { type: 0 } },
            { weekday: 2, start: 9, end: 10, location: '??????-103', note: '', freq: { type: 0 } },
          ],
          exams: [{ date: '2022-04-16', start: '08:00', end: '10:00', location: '' }],
        },
        {
          title: '?????????????????????',
          instructor: '??????',
          quarters: [1],
          sessions: [
            { weekday: 1, start: 1, end: 2, location: '???7-104', note: '', freq: { type: 0 } },
            { weekday: 3, start: 1, end: 2, location: '???7-104', note: '', freq: { type: 0 } },
          ],
          exams: [{ date: '2022-06-13', start: '14:00', end: '16:00', location: '' }],
        },
      ]
      this.selectedCourse = null
      this.selectedSession = null
      this.showCourseBox = []
    },

    clear() {
      this.$reset()
    },
  },
})
