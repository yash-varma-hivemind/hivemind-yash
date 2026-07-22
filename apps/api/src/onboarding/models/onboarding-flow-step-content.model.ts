import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OnboardingFlowStepContentType } from './onboarding-flow-step-content-type.enum';

@ObjectType()
export class OnboardingFlowStepContentModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  stepId!: string;

  @Field(() => OnboardingFlowStepContentType)
  type!: OnboardingFlowStepContentType;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => String, { nullable: true })
  fileName!: string | null;

  @Field(() => String, { nullable: true })
  mimeType!: string | null;

  @Field(() => [String], { nullable: true })
  items!: string[] | null;

  @Field()
  order!: number;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}