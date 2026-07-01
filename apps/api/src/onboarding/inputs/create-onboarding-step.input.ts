import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class CreateOnboardingStepInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  role!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  order!: number;
}