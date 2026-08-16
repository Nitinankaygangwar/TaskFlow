const { isValidAssignmentTarget, validateAssignmentInput } = require('../../src/services/task.service');

describe('Task assignment validation', () => {
  test('accepts valid same-organization assignee', () => {
    const result = validateAssignmentInput({ userId: 'user-123' });
    expect(result.valid).toBe(true);
  });

  test('rejects invalid user', () => {
    expect(validateAssignmentInput({ userId: '' }).valid).toBe(false);
  });

  test('blocks cross-organization assignee', () => {
    expect(isValidAssignmentTarget({ targetOrganizationId: 'org-b', currentOrganizationId: 'org-a' })).toBe(false);
  });

  test('allows same-organization assignee', () => {
    expect(isValidAssignmentTarget({ targetOrganizationId: 'org-a', currentOrganizationId: 'org-a' })).toBe(true);
  });
});
