import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class AssignOnboardingFlowInput {
  @Field(() => ID)
  @IsUUID('4')
  flowId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  userId!: string;
}