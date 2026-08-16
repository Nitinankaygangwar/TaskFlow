const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany({});
  await prisma.taskAssignment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.orgMember.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  const passwordHash = await bcrypt.hash('StrongPassword123!', 12);

  // Create platform admin user
  const platformAdmin = await prisma.user.create({
    data: {
      name: 'Admin Platform',
      email: 'admin@platform.com',
      password: passwordHash,
    },
  });

  const orgA = await prisma.organization.create({ data: { name: 'Acme Labs' } });
  const orgB = await prisma.organization.create({ data: { name: 'Nimbus Studio' } });

  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Alice Admin', email: 'alice@acme.com', password: passwordHash, platformRole: 'user' } }),
    prisma.user.create({ data: { name: 'Bob Member', email: 'bob@acme.com', password: passwordHash, platformRole: 'user' } }),
    prisma.user.create({ data: { name: 'Carol Admin', email: 'carol@nimbus.com', password: passwordHash, platformRole: 'user' } }),
    prisma.user.create({ data: { name: 'David Member', email: 'david@nimbus.com', password: passwordHash, platformRole: 'user' } }),
    prisma.user.create({ data: { name: 'Eve Member', email: 'eve@acme.com', password: passwordHash, platformRole: 'user' } }),
  ]);

  await Promise.all([
    prisma.orgMember.create({ data: { organizationId: orgA.id, userId: users[0].id, role: 'org_admin' } }),
    prisma.orgMember.create({ data: { organizationId: orgA.id, userId: users[1].id, role: 'member' } }),
    prisma.orgMember.create({ data: { organizationId: orgA.id, userId: users[4].id, role: 'member' } }),
    prisma.orgMember.create({ data: { organizationId: orgB.id, userId: users[2].id, role: 'org_admin' } }),
    prisma.orgMember.create({ data: { organizationId: orgB.id, userId: users[3].id, role: 'member' } }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({ data: { organizationId: orgA.id, createdBy: users[0].id, name: 'Website Redesign', description: 'Marketing website refresh' } }),
    prisma.project.create({ data: { organizationId: orgA.id, createdBy: users[0].id, name: 'Mobile QA', description: 'Mobile quality validation' } }),
    prisma.project.create({ data: { organizationId: orgB.id, createdBy: users[2].id, name: 'Launch Sprint', description: 'Product launch sprint' } }),
  ]);

  const tasks = await Promise.all([
    prisma.task.create({ data: { projectId: projects[0].id, organizationId: orgA.id, createdBy: users[0].id, title: 'Homepage copy review', description: 'Finalize landing page copy', status: 'todo', priority: 'high', dueDate: new Date('2026-08-20') } }),
    prisma.task.create({ data: { projectId: projects[0].id, organizationId: orgA.id, createdBy: users[0].id, title: 'Header nav update', description: 'Improve navigation layout', status: 'in_progress', priority: 'medium', dueDate: new Date('2026-08-18') } }),
    prisma.task.create({ data: { projectId: projects[1].id, organizationId: orgA.id, createdBy: users[0].id, title: 'Bug triage', description: 'Review reported mobile bugs', status: 'review', priority: 'urgent', dueDate: new Date('2026-08-17') } }),
    prisma.task.create({ data: { projectId: projects[1].id, organizationId: orgA.id, createdBy: users[1].id, title: 'Regression checklist', description: 'Run final regression', status: 'done', priority: 'low', dueDate: new Date('2026-08-16') } }),
    prisma.task.create({ data: { projectId: projects[2].id, organizationId: orgB.id, createdBy: users[2].id, title: 'Campaign assets', description: 'Prepare launch assets', status: 'todo', priority: 'high', dueDate: new Date('2026-08-19') } }),
    prisma.task.create({ data: { projectId: projects[2].id, organizationId: orgB.id, createdBy: users[2].id, title: 'Launch checklist', description: 'Review launch checklist', status: 'in_progress', priority: 'medium', dueDate: new Date('2026-08-21') } }),
    prisma.task.create({ data: { projectId: projects[2].id, organizationId: orgB.id, createdBy: users[3].id, title: 'Pricing review', description: 'Confirm pricing copy', status: 'review', priority: 'high', dueDate: new Date('2026-08-22') } }),
    prisma.task.create({ data: { projectId: projects[0].id, organizationId: orgA.id, createdBy: users[1].id, title: 'Accessibility fixes', description: 'Fix keyboard focus states', status: 'done', priority: 'medium', dueDate: new Date('2026-08-15') } }),
    prisma.task.create({ data: { projectId: projects[1].id, organizationId: orgA.id, createdBy: users[4].id, title: 'Test environment update', description: 'Sync staging and QA env', status: 'todo', priority: 'low', dueDate: new Date('2026-08-23') } }),
    prisma.task.create({ data: { projectId: projects[2].id, organizationId: orgB.id, createdBy: users[2].id, title: 'Stakeholder update', description: 'Prepare launch notes', status: 'done', priority: 'urgent', dueDate: new Date('2026-08-14') } }),
  ]);

  const memberA = await prisma.orgMember.findFirst({ where: { organizationId: orgA.id, userId: users[0].id } });
  const memberB = await prisma.orgMember.findFirst({ where: { organizationId: orgA.id, userId: users[1].id } });
  const memberC = await prisma.orgMember.findFirst({ where: { organizationId: orgB.id, userId: users[2].id } });

  await Promise.all([
    prisma.taskAssignment.create({ data: { taskId: tasks[0].id, userId: users[0].id } }),
    prisma.taskAssignment.create({ data: { taskId: tasks[1].id, userId: users[1].id } }),
    prisma.taskAssignment.create({ data: { taskId: tasks[2].id, userId: users[4].id } }),
    prisma.taskAssignment.create({ data: { taskId: tasks[4].id, userId: users[3].id } }),
    prisma.taskAssignment.create({ data: { taskId: tasks[5].id, userId: users[2].id } }),
  ]);

  await Promise.all([
    prisma.comment.create({ data: { taskId: tasks[0].id, orgMemberId: memberA.id, content: 'Need final signoff before publishing.' } }),
    prisma.comment.create({ data: { taskId: tasks[1].id, orgMemberId: memberB.id, content: 'Layout is updated and awaiting QA.' } }),
    prisma.comment.create({ data: { taskId: tasks[5].id, orgMemberId: memberC.id, content: 'Launch review is scheduled for tomorrow.' } }),
  ]);

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
