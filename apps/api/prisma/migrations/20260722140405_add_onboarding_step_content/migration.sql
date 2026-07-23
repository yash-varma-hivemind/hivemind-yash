-- CreateEnum
CREATE TYPE "OnboardingFlowStepContentType" AS ENUM ('RICH_TEXT', 'VIDEO', 'DOCUMENT', 'CHECKLIST', 'EXTERNAL_LINK');

-- AlterTable
ALTER TABLE "OnboardingFlowStep" ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "OnboardingFlowStepContent" (
    "id" UUID NOT NULL,
    "stepId" UUID NOT NULL,
    "type" "OnboardingFlowStepContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "items" JSONB,
    "metadata" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingFlowStepContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OnboardingFlowStepContent_stepId_order_idx" ON "OnboardingFlowStepContent"("stepId", "order");

-- AddForeignKey
ALTER TABLE "OnboardingFlowStepContent" ADD CONSTRAINT "OnboardingFlowStepContent_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingFlowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
