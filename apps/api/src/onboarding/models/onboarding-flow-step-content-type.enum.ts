import { registerEnumType } from '@nestjs/graphql';

export enum OnboardingFlowStepContentType {
  RICH_TEXT = 'RICH_TEXT',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  CHECKLIST = 'CHECKLIST',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

registerEnumType(OnboardingFlowStepContentType, {
  name: 'OnboardingFlowStepContentType',
});
