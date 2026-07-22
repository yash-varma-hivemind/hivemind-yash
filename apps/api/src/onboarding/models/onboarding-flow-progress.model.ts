import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingFlowProgressModel {
  @Field()
  completed!: number;

  @Field()
  total!: number;

  @Field()
  percentage!: number;
}