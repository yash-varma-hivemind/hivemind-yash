import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingService } from './onboarding.service';

function createMockPrisma() {
  return {
    onboardingEnrollment: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    onboardingStep: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    onboardingStepCompletion: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

describe('OnboardingService', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let service: OnboardingService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new OnboardingService(prisma as unknown as PrismaService);
  });

  it('calculates current user onboarding progress', async () => {
    prisma.onboardingEnrollment.findUnique.mockResolvedValue({
      userId: 'employee-1',
      role: 'software-engineer',
    });

    prisma.onboardingStep.findMany.mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        role: 'software-engineer',
        title: 'Step 1',
        body: 'Body 1',
        order: 1,
      },
      {
        id: '11111111-1111-4111-8111-111111111112',
        role: 'software-engineer',
        title: 'Step 2',
        body: 'Body 2',
        order: 2,
      },
      {
        id: '11111111-1111-4111-8111-111111111113',
        role: 'software-engineer',
        title: 'Step 3',
        body: 'Body 3',
        order: 3,
      },
    ]);

    prisma.onboardingStepCompletion.findMany.mockResolvedValue([
      {
        stepId: '11111111-1111-4111-8111-111111111111',
        completedAt: new Date('2026-07-01T10:00:00.000Z'),
      },
    ]);

    await expect(service.getMyProgress('employee-1')).resolves.toEqual({
      completed: 1,
      total: 3,
      percentage: 33.33,
    });
  });

  it('marks an allowed onboarding step as complete', async () => {
    const completedAt = new Date('2026-07-01T10:00:00.000Z');

    prisma.onboardingEnrollment.findUnique.mockResolvedValue({
      userId: 'employee-1',
      role: 'software-engineer',
    });

    prisma.onboardingStep.findFirst.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      role: 'software-engineer',
      title: 'Complete company orientation',
      body: 'Review company information.',
      order: 1,
    });

    prisma.onboardingStepCompletion.upsert.mockResolvedValue({
      userId: 'employee-1',
      stepId: '11111111-1111-4111-8111-111111111111',
      completedAt,
    });

    await expect(
      service.setStepComplete(
        'employee-1',
        '11111111-1111-4111-8111-111111111111',
      ),
    ).resolves.toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      completed: true,
      completedAt,
    });

    expect(prisma.onboardingStepCompletion.upsert).toHaveBeenCalledWith({
      where: {
        userId_stepId: {
          userId: 'employee-1',
          stepId: '11111111-1111-4111-8111-111111111111',
        },
      },
      update: {
        completedAt: expect.any(Date),
      },
      create: {
        userId: 'employee-1',
        stepId: '11111111-1111-4111-8111-111111111111',
      },
    });
  });

  it('rejects role assignment outside the manager team', async () => {
    await expect(
      service.assignRole('manager-1', {
        userId: 'outside-user',
        role: 'software-engineer',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns manager team progress for enrolled and unenrolled users', async () => {
    prisma.onboardingEnrollment.findUnique.mockImplementation(
      ({ where }: { where: { userId: string } }) => {
        if (where.userId === 'employee-1') {
          return Promise.resolve({
            userId: 'employee-1',
            role: 'software-engineer',
          });
        }

        return Promise.resolve(null);
      },
    );

    prisma.onboardingStep.count.mockResolvedValue(3);
    prisma.onboardingStepCompletion.count.mockResolvedValue(2);

    await expect(service.getTeamProgress('manager-1')).resolves.toEqual([
      {
        userId: 'employee-1',
        name: 'Emma Employee',
        role: 'software-engineer',
        completed: 2,
        total: 3,
        percentage: 66.67,
        enrolled: true,
      },
      {
        userId: 'employee-2',
        name: 'Ethan Employee',
        role: null,
        completed: 0,
        total: 0,
        percentage: 0,
        enrolled: false,
      },
    ]);
  });

  it('rejects duplicate steps in reorder requests', async () => {
    await expect(
      service.reorderSteps({
        role: 'software-engineer',
        steps: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            order: 1,
          },
          {
            id: '11111111-1111-4111-8111-111111111111',
            order: 2,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});