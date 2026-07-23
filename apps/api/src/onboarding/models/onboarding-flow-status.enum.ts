import { registerEnumType } from '@nestjs/graphql';

export enum OnboardingFlowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

registerEnumType(OnboardingFlowStatus, {
  name: 'OnboardingFlowStatus',
});