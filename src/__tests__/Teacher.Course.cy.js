import { mount, unmount } from '@cypress/react'
import App from '../App'
import { teacher1 } from './credentials'
import specTitle from 'cypress-sonarqube-reporter/specTitle'
import {
  teacher1Mock,
  whoamiTeacherMock,
  coursesMock,
  course1Mock,
  filterCourseByNameMock,
  courseNameToBeCheckedMock,
  course1ExamInfosMock
} from './mocks/responses'

describe(specTitle('Course'), () => {
  beforeEach(() => {
    mount(<App />)
    cy.intercept('GET', `/whoami`, whoamiTeacherMock).as('getWhoami')
    cy.intercept('GET', `/teachers/${teacher1Mock.id}`, teacher1Mock).as('getTeacher1')
    cy.intercept('GET', `/courses?page=1&page_size=10`, coursesMock).as('getCourses')
    cy.intercept('GET', `/courses?page=2&page_size=10`, coursesMock).as('getCoursesPage2')
    //TODO: change /courses/${1}/exams to /courses/${course1Mock.id}/exams
    cy.intercept('GET', `/courses/${1}/exams`, course1ExamInfosMock).as('getCourse1Exams')
    cy.intercept('GET', `/courses/${course1Mock.id}`, course1Mock).as('getCourse1')
    cy.get('#username').type(teacher1.username)
    cy.get('#password').type(teacher1.password)
    cy.get('button').contains('Connexion').click()
    cy.get('.RaMultiLevelMenu-navWithCategories').contains('Cours').click()
    cy.wait('@getCourses')
  })

  it('can read list and filter', () => {
    cy.get('button').contains('Suivant').click()
    cy.wait('@getCoursesPage2')
    cy.contains('Page : 2')
    cy.get('#main-content')
      .should('contain', 'Code')
      .and('contain', 'Nom')
      .and('contain', 'Heure total')
      .and('contain', 'Coefficient')
      .and('contain', `Taille : ${coursesMock.length}`)
    cy.get('td').should('contain', course1Mock.name)
    cy.intercept('GET', `/courses?name=${courseNameToBeCheckedMock}&page=1&page_size=10`, filterCourseByNameMock).as('getCoursesfiltred')
    cy.get('[data-testid="FilterListIcon"]').click()
    cy.get('[data-key="name"]').click()
    cy.get('#name').type(courseNameToBeCheckedMock)
    cy.wait('@getCoursesfiltred')
    cy.get('#main-content').should('contain', `Taille : ${filterCourseByNameMock.length}`).and('contain', courseNameToBeCheckedMock)
    cy.get('[data-testid="HighlightOffIcon"] > path').click()
  })

  it('can read one course details but can not.edit', () => {
    cy.get('.MuiToolbar-root').should('not.contain', 'Éditer')
    cy.get('td').should('not.contain', 'Éditer')
    cy.get('td').contains(course1Mock.name).click()
    cy.wait('@getCourse1')
    //TODO: list of exam
    cy.get('.RaBreadcrumb-list').should('contain', course1Mock.code)
    cy.get('#main-content')
      .should('contain', 'code')
      .and('contain', course1Mock.name)
      .and('contain', course1Mock.code)
      .and('contain', course1Mock.credits)
      .and('not.contain', 'Éditer')
    cy.get('table').should('contain', 'Détails').and('contain', 'Coefficient')
  })

  afterEach(() => {
    cy.get('.RaMultiLevelMenu-navWithCategories').contains('Mon profil').click()
    cy.wait('@getTeacher1')
    unmount()
  })
})
