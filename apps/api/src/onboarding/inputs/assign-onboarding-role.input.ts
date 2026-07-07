import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class AssignOnboardingRoleInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role!: string;
}