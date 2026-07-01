import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class ReorderOnboardingStepInput {
  @Field(() => ID)
  @IsUUID('4')
  id!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order!: number;
}