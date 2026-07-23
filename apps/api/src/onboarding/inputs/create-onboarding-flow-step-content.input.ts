import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { OnboardingFlowStepContentType } from '../models/onboarding-flow-step-content-type.enum';

@InputType()
export class CreateOnboardingFlowStepContentInput {
  @Field(() => ID)
  @IsUUID('4')
  stepId!: string;

  @Field(() => OnboardingFlowStepContentType)
  @IsEnum(OnboardingFlowStepContentType)
  type!: OnboardingFlowStepContentType;

  @Field()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  body?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  url?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fileName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  items?: string[];

  @Field()
  @IsInt()
  @Min(1)
  order!: number;
}