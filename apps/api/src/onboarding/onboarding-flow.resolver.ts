import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import type { CurrentUserData } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePerms } from '../auth/require-perms.decorator';
import { AssignOnboardingFlowInput } from './inputs/assign-onboarding-flow.input';
import { CreateOnboardingFlowStepContentInput } from './inputs/create-onboarding-flow-step-content.input';
import { CreateOnboardingFlowStepInput } from './inputs/create-onboarding-flow-step.input';
import { CreateOnboardingFlowInput } from './inputs/create-onboarding-flow.input';
import { UpdateOnboardingFlowStepContentInput } from './inputs/update-onboarding-flow-step-content.input';
import { UpdateOnboardingFlowStepInput } from './inputs/update-onboarding-flow-step.input';
import { UpdateOnboardingFlowInput } from './inputs/update-onboarding-flow.input';
import { OnboardingFlowAssignmentModel } from './models/onboarding-flow-assignment.model';
import { OnboardingFlowStatus } from './models/onboarding-flow-status.enum';
import { OnboardingFlowStepContentModel } from './models/onboarding-flow-step-content.model';
import { OnboardingFlowStepModel } from './models/onboarding-flow-step.model';
import { OnboardingFlowModel } from './models/onboarding-flow.model';
import { OnboardingFlowService } from './onboarding-flow.service';
import { OnboardingFlowProgressModel } from './models/onboarding-flow-progress.model';
@Resolver()
export class OnboardingFlowResolver {
  constructor(
    private readonly onboardingFlowService: OnboardingFlowService,
  ) {}

  @Query(() => [OnboardingFlowModel])
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingFlows(
    @Args('status', {
      type: () => OnboardingFlowStatus,
      nullable: true,
    })
    status?: OnboardingFlowStatus,
  ): Promise<OnboardingFlowModel[]> {
    return this.onboardingFlowService.listFlows(status);
  }

  @Query(() => OnboardingFlowModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingFlow(
    @Args(
      'id',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  ): Promise<OnboardingFlowModel> {
    return this.onboardingFlowService.getFlow(id);
  }

  @Query(() => OnboardingFlowModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingPreviewFlow(
    @Args(
      'id',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  ): Promise<OnboardingFlowModel> {
    return this.onboardingFlowService.getFlow(id);
  }

  @Mutation(() => OnboardingFlowModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingCreateFlow(
    @CurrentUser() user: CurrentUserData,
    @Args('input') input: CreateOnboardingFlowInput,
  ): Promise<OnboardingFlowModel> {
    return this.onboardingFlowService.createFlow(user.id, input);
  }

  @Mutation(() => OnboardingFlowModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingUpdateFlow(
    @Args('input') input: UpdateOnboardingFlowInput,
  ): Promise<OnboardingFlowModel> {
    return this.onboardingFlowService.updateFlow(input);
  }

  @Mutation(() => OnboardingFlowStepModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingCreateFlowStep(
    @Args('input') input: CreateOnboardingFlowStepInput,
  ): Promise<OnboardingFlowStepModel> {
    return this.onboardingFlowService.createStep(input);
  }

  @Mutation(() => OnboardingFlowStepModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingUpdateFlowStep(
    @Args('input') input: UpdateOnboardingFlowStepInput,
  ): Promise<OnboardingFlowStepModel> {
    return this.onboardingFlowService.updateStep(input);
  }

  @Mutation(() => OnboardingFlowStepContentModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingCreateFlowStepContent(
    @Args('input') input: CreateOnboardingFlowStepContentInput,
  ): Promise<OnboardingFlowStepContentModel> {
    return this.onboardingFlowService.createStepContent(input);
  }

  @Mutation(() => OnboardingFlowStepContentModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingUpdateFlowStepContent(
    @Args('input') input: UpdateOnboardingFlowStepContentInput,
  ): Promise<OnboardingFlowStepContentModel> {
    return this.onboardingFlowService.updateStepContent(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingDeleteFlowStepContent(
    @Args(
      'id',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  ): Promise<boolean> {
    return this.onboardingFlowService.deleteStepContent(id);
  }

  @Mutation(() => OnboardingFlowModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:manage')
  onboardingPublishFlow(
    @Args(
      'id',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    id: string,
  ): Promise<OnboardingFlowModel> {
    return this.onboardingFlowService.publishFlow(id);
  }

  @Mutation(() => OnboardingFlowAssignmentModel)
  @UseGuards(PermissionsGuard)
  @RequirePerms('onboarding:track-team')
  onboardingAssignFlow(
    @CurrentUser() user: CurrentUserData,
    @Args('input') input: AssignOnboardingFlowInput,
  ): Promise<OnboardingFlowAssignmentModel> {
    return this.onboardingFlowService.assignFlow(user.id, input);
  }
    @Query(() => OnboardingFlowAssignmentModel, { nullable: true })
  onboardingMyAssignedFlow(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingFlowAssignmentModel | null> {
    return this.onboardingFlowService.getMyAssignedFlow(user.id);
  }

  @Query(() => [OnboardingFlowStepModel])
  onboardingMyAssignedFlowSteps(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingFlowStepModel[]> {
    return this.onboardingFlowService.getMyAssignedFlowSteps(user.id);
  }

  @Query(() => OnboardingFlowProgressModel)
  onboardingMyAssignedFlowProgress(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingFlowProgressModel> {
    return this.onboardingFlowService.getMyAssignedFlowProgress(user.id);
  }

  @Mutation(() => OnboardingFlowStepModel)
  onboardingCompleteAssignedFlowStep(
    @CurrentUser() user: CurrentUserData,
    @Args(
      'stepId',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    stepId: string,
  ): Promise<OnboardingFlowStepModel> {
    return this.onboardingFlowService.completeAssignedFlowStep(
      user.id,
      stepId,
    );
  }

  @Mutation(() => OnboardingFlowStepModel)
  onboardingIncompleteAssignedFlowStep(
    @CurrentUser() user: CurrentUserData,
    @Args(
      'stepId',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    stepId: string,
  ): Promise<OnboardingFlowStepModel> {
    return this.onboardingFlowService.incompleteAssignedFlowStep(
      user.id,
      stepId,
    );
  }
}