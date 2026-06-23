import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CurrentUser')
export class CurrentUserModel {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => [String])
  roles!: string[];
}