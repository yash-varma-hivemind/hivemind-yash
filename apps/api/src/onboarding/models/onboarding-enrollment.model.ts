import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType('OnboardingEnrollment')
export class OnboardingEnrollmentModel {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  role!: string;

  @Field(() => GraphQLISODateTime)
  enrolledAt!: Date;
}