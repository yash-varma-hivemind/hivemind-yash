import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReorderOnboardingStepInput } from './reorder-onboarding-step.input';

@InputType()
export class ReorderOnboardingStepsInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role!: string;

  @Field(() => [ReorderOnboardingStepInput])
  @IsArray()
  @ArrayMinSize(1)
  steps!: ReorderOnboardingStepInput[];
}