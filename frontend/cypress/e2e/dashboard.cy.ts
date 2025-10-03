describe('Team Collaboration Dashboard', () => {
  beforeEach(() => {
    cy.login(); // Custom command to handle Firebase auth
    cy.visit('/dashboard');
  });

  it('should display the main dashboard', () => {
    cy.contains('Team Dashboard').should('be.visible');
    cy.contains('Task Board').should('be.visible');
  });

  it('should allow task creation', () => {
    cy.get('[data-testid="create-task-btn"]').click();
    cy.get('[data-testid="task-title"]').type('Test Task');
    cy.get('[data-testid="task-description"]').type('Test Description');
    cy.get('[data-testid="save-task"]').click();
    
    cy.contains('Test Task').should('be.visible');
  });

  it('should support drag and drop', () => {
    cy.get('[data-testid="task-card"]').first().as('task');
    cy.get('[data-testid="todo-column"]').as('todo');
    cy.get('[data-testid="in-progress-column"]').as('inProgress');

    cy.get('@task').drag('@inProgress');
    cy.get('@inProgress').contains('Test Task').should('be.visible');
  });
});
