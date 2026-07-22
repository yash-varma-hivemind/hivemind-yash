import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isTeamMember } from '../auth/fake-teams';
import { OnboardingFlowProgressModel } from './models/onboarding-flow-progress.model';
import { PrismaService } from '../prisma/prisma.service';
import { AssignOnboardingFlowInput } from './inputs/assign-onboarding-flow.input';
import { CreateOnboardingFlowInput } from './inputs/create-onboarding-flow.input';
import { CreateOnboardingFlowStepContentInput } from './inputs/create-onboarding-flow-step-content.input';
import { CreateOnboardingFlowStepInput } from './inputs/create-onboarding-flow-step.input';
import { UpdateOnboardingFlowInput } from './inputs/update-onboarding-flow.input';
import { UpdateOnboardingFlowStepContentInput } from './inputs/update-onboarding-flow-step-content.input';
import { UpdateOnboardingFlowStepInput } from './inputs/update-onboarding-flow-step.input';
import { OnboardingFlowAssignmentModel } from './models/onboarding-flow-assignment.model';
import { OnboardingFlowStatus } from './models/onboarding-flow-status.enum';
import { OnboardingFlowStepContentModel } from './models/onboarding-flow-step-content.model';
import { OnboardingFlowStepModel } from './models/onboarding-flow-step.model';
import { OnboardingFlowModel } from './models/onboarding-flow.model';

@Injectable()
export class OnboardingFlowService {
  constructor(private readonly prisma: PrismaService) {}

  async listFlows(
    status?: OnboardingFlowStatus,
  ): Promise<OnboardingFlowModel[]> {
    const flows = await this.prisma.onboardingFlow.findMany({
      where: status
        ? {
            status,
          }
        : undefined,
      orderBy: {
        updatedAt: 'desc',
      },
      include: this.flowInclude(),
    });

    return flows.map((flow) => this.mapFlow(flow));
  }

  async getFlow(id: string): Promise<OnboardingFlowModel> {
    const flow = await this.prisma.onboardingFlow.findUnique({
      where: {
        id,
      },
      include: this.flowInclude(),
    });

    if (!flow) {
      throw new NotFoundException('Onboarding flow was not found');
    }

    return this.mapFlow(flow);
  }

  async createFlow(
    managerId: string,
    input: CreateOnboardingFlowInput,
  ): Promise<OnboardingFlowModel> {
    const flow = await this.prisma.onboardingFlow.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim(),
        role: input.role.trim(),
        createdBy: managerId,
        status: OnboardingFlowStatus.DRAFT,
      },
      include: this.flowInclude(),
    });

    return this.mapFlow(flow);
  }

  async updateFlow(
    input: UpdateOnboardingFlowInput,
  ): Promise<OnboardingFlowModel> {
    const existingFlow =
      await this.prisma.onboardingFlow.findUnique({
        where: {
          id: input.id,
        },
      });

    if (!existingFlow) {
      throw new NotFoundException('Onboarding flow was not found');
    }

    const hasChanges =
      input.name !== undefined ||
      input.description !== undefined ||
      input.role !== undefined;

    if (!hasChanges) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    const updatedFlow = await this.prisma.onboardingFlow.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name?.trim(),
        description: input.description?.trim(),
        role: input.role?.trim(),
        status: OnboardingFlowStatus.DRAFT,
        publishedAt: null,
      },
      include: this.flowInclude(),
    });

    return this.mapFlow(updatedFlow);
  }

  async createStep(
    input: CreateOnboardingFlowStepInput,
  ): Promise<OnboardingFlowStepModel> {
    const flow = await this.prisma.onboardingFlow.findUnique({
      where: {
        id: input.flowId,
      },
    });

    if (!flow) {
      throw new NotFoundException('Onboarding flow was not found');
    }

    const existingOrder =
      await this.prisma.onboardingFlowStep.findFirst({
        where: {
          flowId: input.flowId,
          order: input.order,
        },
      });

    if (existingOrder) {
      throw new BadRequestException(
        `Order ${input.order} is already used in this flow`,
      );
    }

    await this.moveFlowBackToDraft(input.flowId);

    const step = await this.prisma.onboardingFlowStep.create({
      data: {
        flowId: input.flowId,
        title: input.title.trim(),
        body: input.body.trim(),
        notes: input.notes?.trim(),
        isRequired: input.isRequired ?? true,
        order: input.order,
      },
      include: this.stepInclude(),
    });

    return this.mapStep(step);
  }

  async updateStep(
    input: UpdateOnboardingFlowStepInput,
  ): Promise<OnboardingFlowStepModel> {
    const existingStep =
      await this.prisma.onboardingFlowStep.findUnique({
        where: {
          id: input.id,
        },
        include: {
          flow: true,
        },
      });

    if (!existingStep) {
      throw new NotFoundException('Onboarding flow step was not found');
    }

    const hasChanges =
      input.title !== undefined ||
      input.body !== undefined ||
      input.notes !== undefined ||
      input.isRequired !== undefined ||
      input.order !== undefined;

    if (!hasChanges) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    if (input.order !== undefined) {
      const conflictingStep =
        await this.prisma.onboardingFlowStep.findFirst({
          where: {
            flowId: existingStep.flowId,
            order: input.order,
            NOT: {
              id: input.id,
            },
          },
        });

      if (conflictingStep) {
        throw new BadRequestException(
          `Order ${input.order} is already used in this flow`,
        );
      }
    }

    await this.moveFlowBackToDraft(existingStep.flowId);

    const updatedStep =
      await this.prisma.onboardingFlowStep.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title?.trim(),
          body: input.body?.trim(),
          notes: input.notes?.trim(),
          isRequired: input.isRequired,
          order: input.order,
        },
        include: this.stepInclude(),
      });

    return this.mapStep(updatedStep);
  }

  async createStepContent(
    input: CreateOnboardingFlowStepContentInput,
  ): Promise<OnboardingFlowStepContentModel> {
    const step = await this.prisma.onboardingFlowStep.findUnique({
      where: {
        id: input.stepId,
      },
    });

    if (!step) {
      throw new NotFoundException('Onboarding flow step was not found');
    }

    const existingOrder =
      await this.prisma.onboardingFlowStepContent.findFirst({
        where: {
          stepId: input.stepId,
          order: input.order,
        },
      });

    if (existingOrder) {
      throw new BadRequestException(
        `Order ${input.order} is already used in this step`,
      );
    }

    await this.moveFlowBackToDraft(step.flowId);

    const content =
      await this.prisma.onboardingFlowStepContent.create({
        data: {
          stepId: input.stepId,
          type: input.type,
          title: input.title.trim(),
          body: input.body?.trim(),
          url: input.url?.trim(),
          fileName: input.fileName?.trim(),
          mimeType: input.mimeType?.trim(),
          items: input.items ?? undefined,
          order: input.order,
        },
      });

    return this.mapContent(content);
  }

  async updateStepContent(
    input: UpdateOnboardingFlowStepContentInput,
  ): Promise<OnboardingFlowStepContentModel> {
    const existingContent =
      await this.prisma.onboardingFlowStepContent.findUnique({
        where: {
          id: input.id,
        },
        include: {
          step: true,
        },
      });

    if (!existingContent) {
      throw new NotFoundException(
        'Onboarding flow step content was not found',
      );
    }

    if (input.order !== undefined) {
      const conflictingContent =
        await this.prisma.onboardingFlowStepContent.findFirst({
          where: {
            stepId: existingContent.stepId,
            order: input.order,
            NOT: {
              id: input.id,
            },
          },
        });

      if (conflictingContent) {
        throw new BadRequestException(
          `Order ${input.order} is already used in this step`,
        );
      }
    }

    await this.moveFlowBackToDraft(existingContent.step.flowId);

    const updatedContent =
      await this.prisma.onboardingFlowStepContent.update({
        where: {
          id: input.id,
        },
        data: {
          type: input.type,
          title: input.title?.trim(),
          body: input.body?.trim(),
          url: input.url?.trim(),
          fileName: input.fileName?.trim(),
          mimeType: input.mimeType?.trim(),
          items:
            input.items === undefined ? undefined : input.items,
          order: input.order,
        },
      });

    return this.mapContent(updatedContent);
  }

  async deleteStepContent(id: string): Promise<boolean> {
    const existingContent =
      await this.prisma.onboardingFlowStepContent.findUnique({
        where: {
          id,
        },
        include: {
          step: true,
        },
      });

    if (!existingContent) {
      throw new NotFoundException(
        'Onboarding flow step content was not found',
      );
    }

    await this.moveFlowBackToDraft(existingContent.step.flowId);

    await this.prisma.onboardingFlowStepContent.delete({
      where: {
        id,
      },
    });

    return true;
  }

  async publishFlow(id: string): Promise<OnboardingFlowModel> {
    const flow = await this.prisma.onboardingFlow.findUnique({
      where: {
        id,
      },
      include: this.flowInclude(),
    });

    if (!flow) {
      throw new NotFoundException('Onboarding flow was not found');
    }

    if (flow.steps.length === 0) {
      throw new BadRequestException(
        'A flow must contain at least one step before publishing',
      );
    }

    const publishedFlow = await this.prisma.onboardingFlow.update({
      where: {
        id,
      },
      data: {
        status: OnboardingFlowStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: this.flowInclude(),
    });

    return this.mapFlow(publishedFlow);
  }

  async assignFlow(
    managerId: string,
    input: AssignOnboardingFlowInput,
  ): Promise<OnboardingFlowAssignmentModel> {
    const userId = input.userId.trim();

    if (!isTeamMember(managerId, userId)) {
      throw new ForbiddenException(
        'You can assign onboarding flows only to your own team members',
      );
    }

    const flow = await this.prisma.onboardingFlow.findUnique({
      where: {
        id: input.flowId,
      },
    });

    if (!flow) {
      throw new NotFoundException('Onboarding flow was not found');
    }

    if (flow.status !== OnboardingFlowStatus.PUBLISHED) {
      throw new BadRequestException(
        'Only published onboarding flows can be assigned',
      );
    }

    const assignment =
      await this.prisma.onboardingFlowAssignment.upsert({
        where: {
          userId,
        },
        update: {
          flowId: input.flowId,
          assignedBy: managerId,
          assignedAt: new Date(),
        },
        create: {
          userId,
          flowId: input.flowId,
          assignedBy: managerId,
        },
        include: {
          flow: {
            include: this.flowInclude(),
          },
        },
      });

    return {
      ...assignment,
      flow: this.mapFlow(assignment.flow),
    };
  }
      async getMyAssignedFlow(
    userId: string,
  ): Promise<OnboardingFlowAssignmentModel | null> {
    const assignment =
      await this.prisma.onboardingFlowAssignment.findUnique({
        where: {
          userId,
        },
        include: {
          flow: {
            include: this.flowInclude(),
          },
        },
      });

    if (!assignment) {
      return null;
    }

    return {
      ...assignment,
      flow: this.mapFlow(assignment.flow),
    };
  }

  async getMyAssignedFlowSteps(
    userId: string,
  ): Promise<OnboardingFlowStepModel[]> {
    const assignment =
      await this.prisma.onboardingFlowAssignment.findUnique({
        where: {
          userId,
        },
        include: {
          flow: {
            include: this.flowInclude(),
          },
        },
      });

    if (!assignment) {
      return [];
    }

    const completions =
      await this.prisma.onboardingFlowStepCompletion.findMany({
        where: {
          assignmentId: assignment.id,
        },
      });

    const completionByStepId = new Map(
      completions.map((completion) => [
        completion.stepId,
        completion.completedAt,
      ]),
    );

    return assignment.flow.steps.map((step) => {
      const completedAt = completionByStepId.get(step.id) ?? null;

      return {
        ...this.mapStep(step),
        completed: completedAt !== null,
        completedAt,
      };
    });
  }

  async getMyAssignedFlowProgress(
    userId: string,
  ): Promise<OnboardingFlowProgressModel> {
    const steps = await this.getMyAssignedFlowSteps(userId);

    const requiredSteps = steps.filter((step) => step.isRequired);
    const completedRequiredSteps = requiredSteps.filter(
      (step) => step.completed,
    );

    const total = requiredSteps.length;
    const completed = completedRequiredSteps.length;

    return {
      completed,
      total,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  async completeAssignedFlowStep(
    userId: string,
    stepId: string,
  ): Promise<OnboardingFlowStepModel> {
    const assignment =
      await this.prisma.onboardingFlowAssignment.findUnique({
        where: {
          userId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'No onboarding flow is assigned to this user',
      );
    }

    const step = await this.prisma.onboardingFlowStep.findFirst({
      where: {
        id: stepId,
        flowId: assignment.flowId,
      },
      include: this.stepInclude(),
    });

    if (!step) {
      throw new NotFoundException(
        'Onboarding flow step was not found for this assigned flow',
      );
    }

    const completion =
      await this.prisma.onboardingFlowStepCompletion.upsert({
        where: {
          assignmentId_stepId: {
            assignmentId: assignment.id,
            stepId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          assignmentId: assignment.id,
          stepId,
        },
      });

    return {
      ...this.mapStep(step),
      completed: true,
      completedAt: completion.completedAt,
    };
  }

  async incompleteAssignedFlowStep(
    userId: string,
    stepId: string,
  ): Promise<OnboardingFlowStepModel> {
    const assignment =
      await this.prisma.onboardingFlowAssignment.findUnique({
        where: {
          userId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'No onboarding flow is assigned to this user',
      );
    }

    const step = await this.prisma.onboardingFlowStep.findFirst({
      where: {
        id: stepId,
        flowId: assignment.flowId,
      },
      include: this.stepInclude(),
    });

    if (!step) {
      throw new NotFoundException(
        'Onboarding flow step was not found for this assigned flow',
      );
    }

    await this.prisma.onboardingFlowStepCompletion.deleteMany({
      where: {
        assignmentId: assignment.id,
        stepId,
      },
    });

    return {
      ...this.mapStep(step),
      completed: false,
      completedAt: null,
    };
  }
  
  private async moveFlowBackToDraft(flowId: string): Promise<void> {
    await this.prisma.onboardingFlow.update({
      where: {
        id: flowId,
      },
      data: {
        status: OnboardingFlowStatus.DRAFT,
        publishedAt: null,
      },
    });
  }

  private flowInclude() {
    return {
      steps: {
        orderBy: {
          order: 'asc' as const,
        },
        include: this.stepInclude(),
      },
    };
  }

  private stepInclude() {
    return {
      contents: {
        orderBy: {
          order: 'asc' as const,
        },
      },
    };
  }

  private mapFlow(flow: any): OnboardingFlowModel {
    return {
      ...flow,
      steps: flow.steps.map((step: any) => this.mapStep(step)),
    };
  }

  private mapStep(step: any): OnboardingFlowStepModel {
    return {
      ...step,
      contents: (step.contents ?? []).map((content: any) =>
        this.mapContent(content),
      ),
    };
  }

  private mapContent(content: any): OnboardingFlowStepContentModel {
    return {
      ...content,
      items: Array.isArray(content.items)
        ? content.items.map(String)
        : null,
    };
  }
}