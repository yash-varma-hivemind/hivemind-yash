import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OnboardingFlowStepContentModel } from './onboarding-flow-step-content.model';

@ObjectType()
export class OnboardingFlowStepModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  flowId!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field(() => String, { nullable: true })
  notes!: string | null;

  @Field()
  isRequired!: boolean;

  @Field()
  order!: number;

  @Field(() => [OnboardingFlowStepContentModel])
  contents!: OnboardingFlowStepContentModel[];

  @Field(() => Boolean, { nullable: true })
  completed?: boolean | null;

  @Field(() => Date, { nullable: true })
  completedAt?: Date | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}