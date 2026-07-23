import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OnboardingFlowResolver } from './onboarding-flow.resolver';
import { OnboardingFlowService } from './onboarding-flow.service';
import { OnboardingResolver } from './onboarding.resolver';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [PrismaModule],
  providers: [
    OnboardingResolver,
    OnboardingService,
    OnboardingFlowResolver,
    OnboardingFlowService,
  ],
})
export class OnboardingModule {}