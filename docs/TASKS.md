# Yash — Task Backlog

This is your list of work, written as "tickets" (individual tasks, the way they'd appear in a tool like Jira). Do them roughly top to bottom.

**The big picture:** over 6 weeks you will build one complete feature — **Employee Onboarding** — from the database all the way to the web page. You'll build it in your own simplified copy of the project (no login system, no multi-company separation — those are deliberately left out). The feature deliberately mirrors the real Onboarding feature in the main Hivemind product, so that when it's done we can copy ("port") it into the main product with very little extra work.

### How to read each ticket

- **Description** — what to build.
- **AC (Acceptance Criteria)** — the checklist that defines "done." When all the AC are true, the ticket is complete.
- **Port Notes** — *why* it's built this way. These notes explain the small choices that make your work easy to merge into the main product later. Following them matters.

> **New terms** are explained the first time they appear, and there is a full **Glossary** in `ONBOARDING.md`. Don't worry if a ticket looks dense — the Description and AC are the important parts; the technical identifiers (names in `code font`) are exact names to use so things line up with the main product.

### Ground rules (these apply to every ticket)

- **Schema-first GraphQL.** Write the API definition first, then the code that fulfils it. (Don't use the alternative "code-first" style.)
- **The "auth seam" (our stand-in for login).** The real product checks who is logged in via a security system (Keycloak). You don't have that. Instead, you'll build a small stand-in: a helper called `@CurrentUser()` that supplies a *fake* current user — read from a request header like `x-user-id`, or a hard-coded default user — giving you their `id`, `name`, and `roles` (a list of permission labels). Your code always asks this helper "who is the user?" and never reads it any other way. **Why it matters:** when we move your feature into the main product, we only have to replace this one helper with the real login check — everything else you wrote stays exactly the same.
- **Permissions are simple text labels.** A permission like `onboarding:manage` is just a string in the user's `roles` list. Use the *same* label names the main product uses (given in each ticket) so they match exactly.
- **Validate every input** using `class-validator` (a library that rejects malformed data).
- **Small, focused changes.** One ticket per "PR" (pull request — a reviewable set of changes) where practical. Use Conventional Commit messages (`feat:`, `fix:`, `chore:`).

---

## EPIC A — Project setup

*(An "epic" is just a group of related tickets.)* This epic gets your project running: the folder structure, the database, the API, and the login stand-in.

### HM-1 — Set up the project structure ("scaffold the monorepo")
**Description:** Create the project skeleton: a single repository ("monorepo") containing two applications — `api` (the NestJS backend) and `web` (the Next.js frontend). Add a `docker-compose.yml` file that runs **only PostgreSQL** (the database).
**AC (done when):**
- `pnpm install` works (downloads dependencies), and `docker compose up -d` starts the database.
- The `api` app starts up as a NestJS server; the `web` app starts up as a Next.js website.
- The README explains the main commands (`dev` to run, `db:migrate` to update the database, `build` to compile).
**Port Notes:** Use the same folder names as the main product (`apps/api`, `apps/web`) so the code drops straight in. For the website's styling/theme, copy the ready-made files from `docs/theme/` (the Hivemind colours, Tailwind setup, and shadcn config) — see `docs/theme/README.md`. Always use the colour "tokens" (like `bg-primary`, `bg-sidebar`, `text-muted-foreground`); never hard-code a specific colour value.

### HM-2 — Connect the database with Prisma
**Description:** Add **Prisma** (the tool that talks to the database) to the `api` app, point it at the PostgreSQL database running in Docker, and create the first (empty) **migration** (a recorded change to the database structure). Set it up so the database code is regenerated automatically after installing.
**AC (done when):** `pnpm db:migrate` runs cleanly and updates the database; the generated, type-safe database client can be used from a NestJS service.
**Port Notes:** Keep everything in one `schema.prisma` file for now; in the main product it's split per feature, but that's our job later.

### HM-3 — Turn on the GraphQL API
**Description:** Add the GraphQL layer to NestJS (using the Apollo engine), in schema-first style. Prove it works with a trivial test query called `health` that simply returns some text.
**AC (done when):** the Apollo "sandbox" (an in-browser tool for trying the API) is reachable at `/graphql`, and the `health` query returns a value.
**Port Notes:** Schema-first matches how the main product's API is defined (in a file called `schema.gql`).

### HM-4 — Build the login stand-in (the "auth seam")
**Description:** Build the fake-user helper described in the Ground Rules: a `@CurrentUser()` helper plus the small piece of setup that reads the user from the `x-user-id` request header (falling back to a default user) and attaches their `id`, `name`, and `roles`. Also add a `@RequirePerms('...')` guard — a gate that blocks a request unless the user has the required permission label.
**AC (done when):**
- A protected test query is refused (permission-denied) when the user lacks the required role.
- Changing the `x-user-id` header (and thus the user's roles) changes whether access is allowed.
**Port Notes:** **This is the single most important piece for a smooth merge.** Keep the helper's name and the shape of the user data identical to the main product, so the *only* change needed upstream is swapping this fake user for the real login check.

---

## EPIC B — Research

### HM-5 — Research how other apps do onboarding
**Description:** Study how comparable products build **employee/user onboarding** — things like role-based steps, progress tracking, manager oversight, checklists, and game-like elements. Look at examples such as Notion, BambooHR, Workday, onboarding templates in Trello/Asana, the new-user flows in Slack and Linear, learning platforms like Moodle, and any onboarding features of likely competitors.
**AC (done when):** there is a short write-up at `docs/research/onboarding-survey.md` that, for each product, covers:
- What counts as an "onboarding step" (e.g. a task, a document to read, a video, a quiz, an acknowledgement).
- How completion and progress are tracked and shown to the user.
- What managers/admins can do (assign steps, track their team, reorder steps, use templates).
- 5–8 concrete ideas worth adopting, ranked by how valuable they are versus how much effort they take.
**Why this matters:** it shapes the data design and the screens in Epics C–E. Do this **before** finalising the database design in HM-6.
**Port Notes:** The findings also feed the real Hivemind roadmap and the second intern's work, so keep them general, not tied only to our product.

> **Note:** a comprehensive version of this research has already been completed for you at `docs/research/onboarding-survey.md`. Your job here is to **read it, confirm it, and choose** which features make up your build — not to start the research from scratch.

---

## EPIC C — Onboarding backend

This epic builds the server-side of the feature. It mirrors the main product's Onboarding code, so the data shapes, names, and permission labels below are intentionally identical to the real thing — please keep them exact.

### HM-6 — Design the data (database tables)
**Description:** Create three Prisma data models (database tables):
- `OnboardingStep` — a single onboarding step. Fields: `id, role, title, body, order, createdAt, updatedAt`. (`role` = which job role the step is for; `order` = its position in the list.)
- `OnboardingEnrollment` — records that a person has been assigned an onboarding role. Fields: `id, userId, role, enrolledAt`.
- `OnboardingStepCompletion` — records that a person completed a specific step. Fields: `id, userId, stepId, completedAt`.
**AC (done when):** the migration applies; the relationships and uniqueness rules are in place (a person can only complete a given step once — unique `(userId, stepId)`); and there's seed data with a couple of roles and their steps.
**Port Notes:** Match the field intent of the main product's migration `0016_add_employee_onboarding`, and keep the model names exactly as above.

### HM-7 — The new-hire's own view (read and update their steps)
**Description:** Build the API for an employee to see and update their own onboarding:
- Read operations (queries): `onboardingMyEnrollment`, `onboardingMySteps`, `onboardingMyProgress`.
- Change operations (mutations): `onboardingSetStepComplete`, `onboardingSetStepIncomplete`.
**AC (done when):** a user sees only the steps for their own enrolment; marking a step complete/incomplete updates their progress; progress is calculated as completed ÷ total. Tested for both the normal case and the unauthorised case.
**Port Notes:** The code must identify the user through the `@CurrentUser()` helper (the "seam") — never by passing a user id in as a parameter.

### HM-8 — Admin tools to manage steps (create, edit, reorder)
**Description:** Build the API for an administrator to manage the steps themselves:
- Read operations: `onboardingRoles`, `onboardingAdminSteps`.
- Change operations: `onboardingCreateStep`, `onboardingUpdateStep`, `onboardingDeleteStep`, `onboardingReorderSteps`.
- Protect all of these with the `onboarding:manage` permission (using the `@RequirePerms` gate).
**AC (done when):** create/edit/delete all work ("CRUD" = Create, Read, Update, Delete); reordering saves the new positions; people without the manage permission are blocked; all inputs are validated.
**Port Notes:** Use the exact permission label `onboarding:manage`, matching the main product.

### HM-9 — Manager / team view
**Description:** Build the API for a manager to oversee their team:
- Read operation: `onboardingTeamProgress`, protected by the `onboarding:track-team` permission.
- Change operation: `onboardingAssignRole` — a manager assigns an onboarding role to a team member, which creates an `OnboardingEnrollment` for them.
**AC (done when):** a manager can see each team member's progress; assigning a role enrols that person and makes their steps appear.
**Port Notes:** Use the exact permission labels `onboarding:track-team` and the role bundle `onboarding-manager`, matching the main product.

---

## EPIC D — Onboarding web pages

This epic builds the screens users actually see, using Next.js, Tailwind, and shadcn/ui, talking to your GraphQL API.

### HM-10 — The new-hire page (`/dashboard/onboarding`)
**AC (done when):** the page lists the user's steps with a complete/incomplete toggle, shows a progress bar, and shows each step's detail (title and body). The page updates immediately when a step is toggled.
**Port Notes:** Use the same web address (route) as the main product: `/dashboard/onboarding`.

### HM-11 — The manager section (on the same page, shown by role)
**AC (done when):** managers additionally see their team's progress and a control to "assign an onboarding role" to someone.
**Port Notes:** Mirrors the main product, where the new-hire view and the manager view live on the same page.

### HM-12 — The admin management page (`/dashboard/onboarding/manage`)
**AC (done when):** a table of steps per role with create/edit/delete and drag-to-reorder. Only available to managers (hidden or blocked for everyone else).
**Port Notes:** Use the same web address as the main product: `/dashboard/onboarding/manage`.

### HM-13 — Connect the frontend to the API with generated, type-safe code
**Description:** Set up **GraphQL Codegen** — a tool that reads your API and automatically generates type-safe code the website uses to call it. Write the API "operations" (the specific queries/mutations the pages need), and replace any hand-written API calls with the generated ones.
**AC (done when):** all the website's data goes through the generated, type-checked code; running `pnpm codegen` regenerates it cleanly.
**Port Notes:** Same approach the main product's website uses.

---

## EPIC E — Final polish & handover

### HM-14 — Tests and demo data
**AC (done when):** services have unit tests, there's at least one end-to-end test per epic, and a `db:seed` command creates demo roles, steps, and users so a reviewer can click through the whole feature.

### HM-15 — Make it ready to merge ("port-readiness")
**AC (done when):** there's a `PORTING.md` document that maps each of your data models, resolvers, routes, and permissions to its equivalent in the main product, and lists the exact stand-ins to swap out (the auth seam; the multi-company data separation). Include a final demo recording.
**Port Notes:** This document is what lets us merge your work into the main product in a single afternoon.

---

## Suggested timeline

This is a guide, not a strict deadline — it assumes ~20 hours per week.

| Week | Focus |
|---|---|
| 1 | Learning Steps 0–3 · tickets HM-1…HM-4 (setup) · HM-5 (read the research) |
| 2 | Learning Step 4 · HM-6, HM-7 (backend core) |
| 3 | HM-8, HM-9 (admin/manager backend) · HM-10 (first web page) |
| 4 | HM-11, HM-12 (web pages) |
| 5 | HM-13 (typed client) · polishing the screens |
| 6 | HM-14, HM-15 (tests, port-readiness, demo) |

If GraphQL or React take longer than expected, let the web pages (Epic D) slip rather than the backend (Epic C) — the backend is the more important part to get right.
