-- CreateEnum
CREATE TYPE "OnboardingFlowStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "OnboardingFlow" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT NOT NULL,
    "status" "OnboardingFlowStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingFlowStep" (
    "id" UUID NOT NULL,
    "flowId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "notes" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingFlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingFlowAssignment" (
    "id" UUID NOT NULL,
    "flowId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingFlowAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingFlowStepCompletion" (
    "id" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingFlowStepCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingFlow_role_status_idx" ON "OnboardingFlow"("role", "status");

-- CreateIndex
CREATE INDEX "OnboardingFlowStep_flowId_order_idx" ON "OnboardingFlowStep"("flowId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingFlowAssignment_userId_key" ON "OnboardingFlowAssignment"("userId");

-- CreateIndex
CREATE INDEX "OnboardingFlowAssignment_flowId_idx" ON "OnboardingFlowAssignment"("flowId");

-- CreateIndex
CREATE INDEX "OnboardingFlowStepCompletion_stepId_idx" ON "OnboardingFlowStepCompletion"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingFlowStepCompletion_assignmentId_stepId_key" ON "OnboardingFlowStepCompletion"("assignmentId", "stepId");

-- AddForeignKey
ALTER TABLE "OnboardingFlowStep" ADD CONSTRAINT "OnboardingFlowStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "OnboardingFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingFlowAssignment" ADD CONSTRAINT "OnboardingFlowAssignment_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "OnboardingFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingFlowStepCompletion" ADD CONSTRAINT "OnboardingFlowStepCompletion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "OnboardingFlowAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingFlowStepCompletion" ADD CONSTRAINT "OnboardingFlowStepCompletion_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingFlowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
