import {
  Field,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType('OnboardingMyStep')
export class OnboardingMyStepModel {
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

  @Field()
  completed!: boolean;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
  })
  completedAt!: Date | null;
}