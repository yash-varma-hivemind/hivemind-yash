import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('OnboardingProgress')
export class OnboardingProgressModel {
  @Field(() => Int)
  completed!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => Float)
  percentage!: number;
}