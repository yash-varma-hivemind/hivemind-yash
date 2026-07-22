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
export class UpdateOnboardingFlowStepContentInput {
  @Field(() => ID)
  @IsUUID('4')
  id!: string;

  @Field(() => OnboardingFlowStepContentType, { nullable: true })
  @IsEnum(OnboardingFlowStepContentType)
  @IsOptional()
  type?: OnboardingFlowStepContentType;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

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

  @Field(() => Number, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;
}