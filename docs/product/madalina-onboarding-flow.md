# Madalina Onboarding Flow Builder

## Confirmed Product Direction

The next onboarding iteration follows Madalina's feedback and Andrei's backend confirmation.

Managers should be able to create onboarding flows without immediately assigning them. A manager should first create and edit the flow, preview it as an employee, publish it when ready, and only then assign it to an employee.

## Confirmed Flow

1. Manager creates an onboarding flow.
2. Flow is saved as Draft.
3. Draft flow is editable by the manager.
4. Manager can preview the flow as if they are a new employee.
5. Preview is used to check content, sequence, and user experience.
6. Manager publishes the flow when ready.
7. Only Published flows can be assigned.
8. Manager assigns the Published flow to an employee.
9. Employee completes the assigned onboarding flow.

## Confirmed Backend Decisions

- Add a new `OnboardingFlow` model.
- Use statuses: `DRAFT` and `PUBLISHED`.
- If a published flow is edited, it should move back to Draft.
- Add a new assignment table linking users to flows.
- Support one active assigned flow per employee for now.
- Flow builder remains role-based.

## Current System

The current system is role-step based:

- `OnboardingStep`
- `OnboardingEnrollment`
- `OnboardingStepCompletion`

This supports role-based onboarding checklists.

## New System

The new system should be flow-based:

- `OnboardingFlow`
- `OnboardingFlowStep`
- `OnboardingFlowAssignment`
- `OnboardingFlowStepCompletion`

This supports draft flows, published flows, preview before assignment, and assignment of a full flow to an employee.

## Business Rules

- Draft flows can be edited.
- Draft flows can be previewed.
- Draft flows cannot be assigned.
- Published flows can be previewed.
- Published flows can be assigned.
- Editing a published flow should move it back to Draft.
- One employee should have one active assigned flow for now.

## Frontend Direction

The frontend should follow Madalina's Figma designs while using the existing repo design system:

- Next.js
- React
- Tailwind
- shadcn/ui
- existing theme and color variables

## Implementation Phases

1. Add database models.
2. Add Prisma migration.
3. Add GraphQL models and inputs.
4. Add backend service methods.
5. Add resolver methods.
6. Test the flow in GraphQL.
7. Run GraphQL Codegen.
8. Update frontend screens using Figma/Stitch.
9. Add tests.
10. Update documentation/demo instructions.
