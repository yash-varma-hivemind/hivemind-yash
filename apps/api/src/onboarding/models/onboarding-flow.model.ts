import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OnboardingFlowStatus } from './onboarding-flow-status.enum';
import { OnboardingFlowStepModel } from './onboarding-flow-step.model';

@ObjectType()
export class OnboardingFlowModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  role!: string;

  @Field(() => OnboardingFlowStatus)
  status!: OnboardingFlowStatus;

  @Field()
  createdBy!: string;

  @Field(() => Date, { nullable: true })
  publishedAt!: Date | null;

  @Field(() => [OnboardingFlowStepModel])
  steps!: OnboardingFlowStepModel[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}