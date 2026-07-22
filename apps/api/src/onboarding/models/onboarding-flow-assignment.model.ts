import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OnboardingFlowModel } from './onboarding-flow.model';

@ObjectType()
export class OnboardingFlowAssignmentModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  flowId!: string;

  @Field()
  userId!: string;

  @Field()
  assignedBy!: string;

  @Field()
  assignedAt!: Date;

  @Field(() => OnboardingFlowModel)
  flow!: OnboardingFlowModel;
}