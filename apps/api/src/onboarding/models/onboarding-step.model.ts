import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType('OnboardingStep')
export class OnboardingStepModel {
  @Field(() => ID)
  id!: string;

  @Field()
  role!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field(() => Int)
  order!: number;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}