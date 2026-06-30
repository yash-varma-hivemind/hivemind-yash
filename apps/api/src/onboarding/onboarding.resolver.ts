import { ParseUUIDPipe } from '@nestjs/common';
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
}