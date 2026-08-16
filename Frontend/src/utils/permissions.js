export const canManageMembers = (role) => role === 'org_admin';
export const canDeleteProject = (role) => role === 'org_admin';
export const canEditProject = (role) => role === 'org_admin';
export const canManageTasks = (role) => role === 'org_admin' || role === 'member';
