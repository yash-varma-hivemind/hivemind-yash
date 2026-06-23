-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingEnrollment" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStepCompletion" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" UUID NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingStepCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingStep_role_order_idx" ON "OnboardingStep"("role", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingEnrollment_userId_key" ON "OnboardingEnrollment"("userId");

-- CreateIndex
CREATE INDEX "OnboardingStepCompletion_stepId_idx" ON "OnboardingStepCompletion"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingStepCompletion_userId_stepId_key" ON "OnboardingStepCompletion"("userId", "stepId");

-- AddForeignKey
ALTER TABLE "OnboardingStepCompletion" ADD CONSTRAINT "OnboardingStepCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OnboardingEnrollment"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingStepCompletion" ADD CONSTRAINT "OnboardingStepCompletion_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
