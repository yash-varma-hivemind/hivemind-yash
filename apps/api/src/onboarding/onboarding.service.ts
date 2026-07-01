import {
  ForbiddenException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingEnrollmentModel } from './models/onboarding-enrollment.model';
import { OnboardingMyStepModel } from './models/onboarding-my-step.model';
import { OnboardingProgressModel } from './models/onboarding-progress.model';
import { CreateOnboardingStepInput } from './inputs/create-onboarding-step.input';
import { ReorderOnboardingStepsInput } from './inputs/reorder-onboarding-steps.input';
import { UpdateOnboardingStepInput } from './inputs/update-onboarding-step.input';
import { OnboardingStepModel } from './models/onboarding-step.model';
@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyEnrollment(
    userId: string,
  ): Promise<OnboardingEnrollmentModel> {
    const enrollment =
      await this.prisma.onboardingEnrollment.findUnique({
        where: {
          userId,
        },
      });

    if (!enrollment) {
      throw new NotFoundException(
        'No onboarding enrollment was found for the current user',
      );
    }

    return enrollment;
  }

  async getMySteps(
    userId: string,
  ): Promise<OnboardingMyStepModel[]> {
    const enrollment = await this.getMyEnrollment(userId);

    const steps = await this.prisma.onboardingStep.findMany({
      where: {
        role: enrollment.role,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const stepIds = steps.map((step) => step.id);

    const completions =
      await this.prisma.onboardingStepCompletion.findMany({
        where: {
          userId,
          stepId: {
            in: stepIds,
          },
        },
        select: {
          stepId: true,
          completedAt: true,
        },
      });

    const completionByStepId = new Map(
      completions.map((completion) => [
        completion.stepId,
        completion.completedAt,
      ]),
    );

    return steps.map((step) => {
      const completedAt =
        completionByStepId.get(step.id) ?? null;

      return {
        ...step,
        completed: completedAt !== null,
        completedAt,
      };
    });
  }

  async getMyProgress(
    userId: string,
  ): Promise<OnboardingProgressModel> {
    const steps = await this.getMySteps(userId);

    const total = steps.length;
    const completed = steps.filter(
      (step) => step.completed,
    ).length;

    const percentage =
      total === 0
        ? 0
        : Math.round((completed / total) * 10000) / 100;

    return {
      completed,
      total,
      percentage,
    };
  }

  async setStepComplete(
    userId: string,
    stepId: string,
  ): Promise<OnboardingMyStepModel> {
    const step = await this.requireAllowedStep(
      userId,
      stepId,
    );

    const completion =
      await this.prisma.onboardingStepCompletion.upsert({
        where: {
          userId_stepId: {
            userId,
            stepId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          userId,
          stepId,
        },
      });

    return {
      ...step,
      completed: true,
      completedAt: completion.completedAt,
    };
  }

  async setStepIncomplete(
    userId: string,
    stepId: string,
  ): Promise<OnboardingMyStepModel> {
    const step = await this.requireAllowedStep(
      userId,
      stepId,
    );

    await this.prisma.onboardingStepCompletion.deleteMany({
      where: {
        userId,
        stepId,
      },
    });

    return {
      ...step,
      completed: false,
      completedAt: null,
    };
  }

  async getRoles(): Promise<string[]> {
  const roles = await this.prisma.onboardingStep.findMany({
    distinct: ['role'],
    orderBy: {
      role: 'asc',
    },
    select: {
      role: true,
    },
  });

  return roles.map(({ role }) => role);
}

async getAdminSteps(role: string): Promise<OnboardingStepModel[]> {
  const normalizedRole = role.trim();

  if (!normalizedRole) {
    throw new BadRequestException('Role is required');
  }

  return this.prisma.onboardingStep.findMany({
    where: {
      role: normalizedRole,
    },
    orderBy: [
      {
        order: 'asc',
      },
      {
        createdAt: 'asc',
      },
    ],
  });
}

async createStep(
  input: CreateOnboardingStepInput,
): Promise<OnboardingStepModel> {
  const role = input.role.trim();
  const title = input.title.trim();
  const body = input.body.trim();

  const existingOrder =
    await this.prisma.onboardingStep.findFirst({
      where: {
        role,
        order: input.order,
      },
    });

  if (existingOrder) {
    throw new BadRequestException(
      `Order ${input.order} is already used for role ${role}`,
    );
  }

  return this.prisma.onboardingStep.create({
    data: {
      role,
      title,
      body,
      order: input.order,
    },
  });
}

async updateStep(
  input: UpdateOnboardingStepInput,
): Promise<OnboardingStepModel> {
  const existingStep =
    await this.prisma.onboardingStep.findUnique({
      where: {
        id: input.id,
      },
    });

  if (!existingStep) {
    throw new NotFoundException('Onboarding step was not found');
  }

  const hasChanges =
    input.role !== undefined ||
    input.title !== undefined ||
    input.body !== undefined ||
    input.order !== undefined;

  if (!hasChanges) {
    throw new BadRequestException(
      'At least one field must be provided for update',
    );
  }

  const nextRole = input.role?.trim() ?? existingStep.role;
  const nextOrder = input.order ?? existingStep.order;

  const conflictingStep =
    await this.prisma.onboardingStep.findFirst({
      where: {
        role: nextRole,
        order: nextOrder,
        NOT: {
          id: input.id,
        },
      },
    });

  if (conflictingStep) {
    throw new BadRequestException(
      `Order ${nextOrder} is already used for role ${nextRole}`,
    );
  }

  return this.prisma.onboardingStep.update({
    where: {
      id: input.id,
    },
    data: {
      role: input.role?.trim(),
      title: input.title?.trim(),
      body: input.body?.trim(),
      order: input.order,
    },
  });
}

async deleteStep(id: string): Promise<boolean> {
  const existingStep =
    await this.prisma.onboardingStep.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

  if (!existingStep) {
    throw new NotFoundException('Onboarding step was not found');
  }

  await this.prisma.onboardingStep.delete({
    where: {
      id,
    },
  });

  return true;
}

async reorderSteps(
  input: ReorderOnboardingStepsInput,
): Promise<OnboardingStepModel[]> {
  const hasInvalidItem = input.steps.some(
    ({ id, order }) =>
      !isUUID(id, '4') ||
      !Number.isInteger(order) ||
      order < 1,
  );

  if (hasInvalidItem) {
    throw new BadRequestException(
      'Each reorder item must contain a valid UUID and an order of at least 1',
    );
  }
  
  const role = input.role.trim();
  const stepIds = input.steps.map(({ id }) => id);
  const positions = input.steps.map(({ order }) => order);

  if (new Set(stepIds).size !== stepIds.length) {
    throw new BadRequestException(
      'Each onboarding step can appear only once',
    );
  }

  if (new Set(positions).size !== positions.length) {
    throw new BadRequestException(
      'Each onboarding step must have a unique order',
    );
  }

  const roleSteps = await this.prisma.onboardingStep.findMany({
    where: {
      role,
    },
    select: {
      id: true,
    },
  });

  if (roleSteps.length === 0) {
    throw new NotFoundException(
      `No onboarding steps were found for role ${role}`,
    );
  }

  const roleStepIds = new Set(roleSteps.map(({ id }) => id));

  const containsInvalidStep = stepIds.some(
    (id) => !roleStepIds.has(id),
  );

  if (containsInvalidStep) {
    throw new BadRequestException(
      'One or more steps do not belong to the selected role',
    );
  }

  if (stepIds.length !== roleSteps.length) {
    throw new BadRequestException(
      'The reorder request must include every step for the selected role',
    );
  }

  await this.prisma.$transaction(
    input.steps.map(({ id, order }) =>
      this.prisma.onboardingStep.update({
        where: {id,},
        data: {order, },}),
    ),
  );

  return this.getAdminSteps(role);
}

  private async requireAllowedStep(
    userId: string,
    stepId: string,
  ) {
    const enrollment = await this.getMyEnrollment(userId);

    const step = await this.prisma.onboardingStep.findFirst({
      where: {
        id: stepId,
        role: enrollment.role,
      },
    });

    if (!step) {
      throw new ForbiddenException(
        'This onboarding step does not belong to your enrolled role',
      );
    }

    return step;
  }
}