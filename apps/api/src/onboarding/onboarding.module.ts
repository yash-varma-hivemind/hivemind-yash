import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OnboardingResolver } from './onboarding.resolver';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [PrismaModule],
  providers: [
    OnboardingResolver,
    OnboardingService,
  ],
  exports: [OnboardingService],
})
export class OnboardingModule {}