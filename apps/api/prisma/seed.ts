import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not configured');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

const onboardingSteps = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    role: 'software-engineer',
    title: 'Complete company orientation',
    body: 'Review the company mission, values, policies and organisational structure.',
    order: 1,
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    role: 'software-engineer',
    title: 'Configure the development environment',
    body: 'Install the required development tools and verify access to the engineering systems.',
    order: 2,
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    role: 'software-engineer',
    title: 'Review engineering standards',
    body: 'Read the coding, testing, Git workflow and pull request guidelines.',
    order: 3,
  },
  {
    id: '22222222-2222-4222-8222-222222222221',
    role: 'product-manager',
    title: 'Complete company orientation',
    body: 'Review the company mission, values, policies and organisational structure.',
    order: 1,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    role: 'product-manager',
    title: 'Review the product strategy',
    body: 'Understand the product vision, customer groups, roadmap and current priorities.',
    order: 2,
  },
  {
    id: '22222222-2222-4222-8222-222222222223',
    role: 'product-manager',
    title: 'Meet key stakeholders',
    body: 'Arrange introductory meetings with engineering, design, sales and customer success.',
    order: 3,
  },
] as const;

async function main(): Promise<void> {
  for (const step of onboardingSteps) {
    await prisma.onboardingStep.upsert({
      where: {
        id: step.id,
      },
      update: {
        role: step.role,
        title: step.title,
        body: step.body,
        order: step.order,
      },
      create: step,
    });
  }

  console.log(`Seeded ${onboardingSteps.length} onboarding steps.`);
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed the database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });