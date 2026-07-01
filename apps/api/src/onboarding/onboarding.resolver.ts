import { ParseUUIDPipe, UseGuards  } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUserData } from '../auth/auth.types';
import { OnboardingEnrollmentModel } from './models/onboarding-enrollment.model';
import { OnboardingMyStepModel } from './models/onboarding-my-step.model';
import { OnboardingProgressModel } from './models/onboarding-progress.model';
import { OnboardingService } from './onboarding.service';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePerms } from '../auth/require-perms.decorator';
import { CreateOnboardingStepInput } from './inputs/create-onboarding-step.input';
import { ReorderOnboardingStepsInput } from './inputs/reorder-onboarding-steps.input';
import { UpdateOnboardingStepInput } from './inputs/update-onboarding-step.input';
import { OnboardingStepModel } from './models/onboarding-step.model';

@Resolver()
export class OnboardingResolver {
  constructor(
    private readonly onboardingService: OnboardingService,
  ) {}

  @Query(() => OnboardingEnrollmentModel)
  onboardingMyEnrollment(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingEnrollmentModel> {
    return this.onboardingService.getMyEnrollment(user.id);
  }

  @Query(() => [OnboardingMyStepModel])
  onboardingMySteps(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingMyStepModel[]> {
    return this.onboardingService.getMySteps(user.id);
  }

  @Query(() => OnboardingProgressModel)
  onboardingMyProgress(
    @CurrentUser() user: CurrentUserData,
  ): Promise<OnboardingProgressModel> {
    return this.onboardingService.getMyProgress(user.id);
  }

  @Mutation(() => OnboardingMyStepModel)
  onboardingSetStepComplete(
    @CurrentUser() user: CurrentUserData,
    @Args(
      'stepId',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    stepId: string,
  ): Promise<OnboardingMyStepModel> {
    return this.onboardingService.setStepComplete(
      user.id,
      stepId,
    );
  }

  @Mutation(() => OnboardingMyStepModel)
  onboardingSetStepIncomplete(
    @CurrentUser() user: CurrentUserData,
    @Args(
      'stepId',
      { type: () => ID },
      new ParseUUIDPipe({ version: '4' }),
    )
    stepId: string,
  ): Promise<OnboardingMyStepModel> {
    return this.onboardingService.setStepIncomplete(
      user.id,
      stepId,
    );
  }
  @Query(() => [String])
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingRoles(): Promise<string[]> {
  return this.onboardingService.getRoles();
}

@Query(() => [OnboardingStepModel])
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingAdminSteps(
  @Args('role') role: string,
): Promise<OnboardingStepModel[]> {
  return this.onboardingService.getAdminSteps(role);
}

@Mutation(() => OnboardingStepModel)
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingCreateStep(
  @Args('input') input: CreateOnboardingStepInput,
): Promise<OnboardingStepModel> {
  return this.onboardingService.createStep(input);
}

@Mutation(() => OnboardingStepModel)
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingUpdateStep(
  @Args('input') input: UpdateOnboardingStepInput,
): Promise<OnboardingStepModel> {
  return this.onboardingService.updateStep(input);
}

@Mutation(() => Boolean)
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingDeleteStep(
  @Args(
    'id',
    { type: () => ID },
    new ParseUUIDPipe({ version: '4' }),
  )
  id: string,
): Promise<boolean> {
  return this.onboardingService.deleteStep(id);
}

@Mutation(() => [OnboardingStepModel])
@UseGuards(PermissionsGuard)
@RequirePerms('onboarding:manage')
onboardingReorderSteps(
  @Args('input') input: ReorderOnboardingStepsInput,
): Promise<OnboardingStepModel[]> {
  return this.onboardingService.reorderSteps(input);
}
}
