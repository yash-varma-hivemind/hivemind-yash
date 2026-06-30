import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingEnrollmentModel } from './models/onboarding-enrollment.model';
import { OnboardingMyStepModel } from './models/onboarding-my-step.model';
import { OnboardingProgressModel } from './models/onboarding-progress.model';

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