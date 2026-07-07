import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('OnboardingTeamProgress')
export class OnboardingTeamProgressModel {
  @Field(() => String)
  userId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  role!: string | null;

  @Field(() => Int)
  completed!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => Float)
  percentage!: number;

  @Field(() => Boolean)
  enrolled!: boolean;
}
