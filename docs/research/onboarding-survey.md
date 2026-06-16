# Employee Onboarding — Competitor Feature & Analytics Research

Comprehensive survey of how onboarding is built across HR platforms, PM/checklist tools, product-adoption SaaS, and LMS/dev-tool flows. Every feature and metric is categorized by **implementation complexity** (in our stack) and **usefulness** (for a role-based employee-onboarding product).

- **Stack assumed:** NestJS + GraphQL (schema-first, Apollo) + Prisma + PostgreSQL backend; Next.js/React frontend; multi-tenant B2B; existing Knowledge Hub (wiki) module.
- **Complexity:** Low = relational CRUD + resolvers we already need · Medium = job queue / event log / aggregation / non-trivial UI · High = external integration (HRIS, IT/MDM, e-sign) or a whole subsystem (rules engine, A/B framework).
- **Usefulness:** scored for *role-based employee onboarding with manager oversight* — not generic LMS.

**Products surveyed:** BambooHR, Workday, Rippling, Gusto, Deel, Sapling/Kallidus, HiBob, Personio (HR) · Notion, Asana, Trello, ClickUp, Monday, Process Street, Confluence, Coda (PM/checklist) · WalkMe, Userpilot, Appcues, Pendo, Userflow, Chameleon, Whatfix, UserGuiding, Intro.js (product adoption) · Moodle, TalentLMS, Docebo, 360Learning, Seismic, WorkRamp (LMS) · Slack, Linear, Notion, GitHub, Figma (dev-tool onboarding).

---

## TL;DR — strategic positioning

The market splits cleanly, and the gap between halves is our opportunity:

- **Dev tools** (Slack/Linear/Notion/Figma) nail *step UX, personalization, empty-state guidance* — but deliberately omit progress %, manager dashboards, reminders, and completion analytics.
- **LMS** (Docebo/360Learning/Moodle) have *tracking, oversight, compliance* — but are bloated with SCORM, recertification, leaderboards, skill ontologies we don't need.
- **HR platforms** win on *provisioning, e-sign, statutory forms* — separate products, out of our scope.

**Our sweet spot: LMS-grade tracking + oversight, dev-tool-grade UX, with Knowledge-Hub content-linking as the wedge.** Most competitors bolt content/training on as a parallel system; we can make onboarding steps deep-link into existing wiki articles as a first-class experience.

### The one architectural decision (every source converged on this)

**Log append-only timestamped events, not a `current_step` status column.** A status column cannot reconstruct drop-off, time-per-step, revisits, or stall points after the fact. Minimum event model:

```
OnboardingEvent(id, tenantId, employeeId, stepId, role, departmentId, managerId,
                eventType, occurredAt)
  eventType ∈ { onboarding_started, step_assigned, step_reached, step_completed,
                step_skipped, content_viewed, login, check_in_completed, flow_completed }
```

Log `step_reached` **and** `step_completed` (entry + exit), plus a daily `login`/`session` row. This single decision makes ~60% of the analytics catalog derivable later **without a schema migration**. A hire who logs in but completes no step is otherwise invisible.

---

## PART 1 — FEATURE CATALOG

### A. Core structure & content

| Feature | Description | Seen in | Complexity | Usefulness |
|---|---|---|---|---|
| **Onboarding steps/tasks** (the primitive) | Discrete, orderable items a user completes | All | Low | **High** |
| **Role/dept/cohort-based step templates** | Step sets that adapt by role, department, location, start-date | BambooHR, Workday, Rippling, Sapling, HiBob, Personio, Docebo, 360Learning | Low (static role→set) / Medium (dynamic attribute rules) | **High** ← headline feature |
| **Paths / sequenced step groups** | Ordered collection forming a journey ("Week 1", "Eng setup") | Docebo, 360Learning, WorkRamp, TalentLMS, Moodle | Low–Medium | **High** |
| **Phased / time-sequenced steps** | Group by stage: pre-day-1, day 1, week 1, 30/60/90 | Personio, BambooHR, Workday, Asana, Monday | Low (`phase` enum + grouped render) | **High** |
| **Link steps to Knowledge Hub / wiki content** ⭐ | Step references existing wiki articles as its content | Notion; none do it *deeply* | Low (we own the wiki) | **High** ← our wedge |
| **Rich content types** (text, video embed, docs, links) | Steps render varied media | All LMS, Coda, Notion, Process Street | Low (text/video/iframe/file) / High (SCORM/xAPI) | **High** text/video · **Low** SCORM (skip) |
| **Templates / starter bundles** | Pre-built onboarding templates admins clone | Slack, Notion, all LMS, ClickUp, Trello | Low–Medium | **Medium–High** |
| **Admin step/template CRUD + reorder** | Authoring UI: create/edit/order/publish | All | Low (CRUD) / Medium (drag-reorder + draft/publish) | **High** ← in scope |
| **Sub-tasks / nested checklists** | Hierarchical breakdown of a step | Notion, ClickUp, Trello, Asana, Coda | Low–Medium (self-ref FK + rollup) | **Medium** |
| **Draft / preview / publish lifecycle** | Test before going live | Whatfix, Chameleon, WalkMe | Low–Medium (`status` + preview route) | **High** for admin editing |
| **Version control of flows** | Track/roll back flow versions | WalkMe, Whatfix | Medium (versioned rows / audit table) | **Medium** |

### B. Assignment, tracking & oversight

| Feature | Description | Seen in | Complexity | Usefulness |
|---|---|---|---|---|
| **Per-user completion tracking** | Each user's status + timestamps per step | All | Low | **High** ← core |
| **Progress bar / % complete** ⭐ | Visual completion gauge | LMS yes; dev tools mostly skip it | Low | **High** (underserved even by leaders) |
| **Multi-stakeholder assignment** | Tasks to HR/IT/manager/buddy, not just the hire | Rippling, Sapling, HiBob, Personio, Process Street | Low–Medium (polymorphic assignee) | **High** |
| **Due dates (absolute + relative-to-hire-date)** | "Start + 3 days" computed deadlines | Asana, Sapling, Personio, BambooHR, Slack Lists | Low (absolute) / Medium (relative) | **High** |
| **Manager / team oversight dashboard** ⭐ | Manager sees direct reports' progress + stalls | Moodle, 360Learning, Docebo, WorkRamp; dev tools lack it | Medium (hierarchy + aggregation + DataLoader) | **High** ← requirement + differentiator |
| **Central admin/HR dashboard** | Org-wide "done / overdue / needs support" | Personio, HiBob, Workday, Gusto | Low–Medium (aggregate queries) | **High** |
| **Auto-enrollment on user join** | New user auto-gets their role's path | Docebo, 360Learning, Moodle, Figma SCIM | Medium (hook user-create event) | **High** |
| **Acknowledgement / sign-off** | "I read & understood" attestation, recorded | Docebo, 360Learning, WorkRamp e-sign | Low (boolean+ts) / Medium (audit trail) | **High** (policy/handbook sign-offs) |
| **Audit trail / completion history** | Immutable log of who completed/signed what, when | BambooHR, Deel, Workday, Moodle, Process Street | Low–Medium (append-only table) | **High** (compliance + trust) |
| **Buddy / mentor assignment** | Pair hire with buddy, surfaced in-app | HiBob (common pattern) | Low (`buddyId` relation) | **High** (cheap, high impact) |
| **Bulk onboarding** | Onboard many hires in one action | Sapling (≤100), Workday | Low–Medium (batch + CSV) | **Medium** |

### C. Workflow logic & automation

| Feature | Description | Seen in | Complexity | Usefulness |
|---|---|---|---|---|
| **Role-based conditional surfacing** | Show/hide steps by role/region/answer | Process Street, Userpilot, Notion views, Monday | Medium (start: role filter; expand later) | **High** (role filter must-have; deep branching = upsell) |
| **Prerequisites / locking / sequencing** | Lock step until prior steps done | Moodle (richest), Docebo, WorkRamp, ClickUp, Asana | Medium (linear) / High (N-of-M DAG + cycle detection) | **Medium** (build linear only) |
| **Stop / gating tasks** | Hard gate hides downstream until cleared | Process Street | Medium (constrained dependency) | **Medium** (compliance gating) |
| **Approvals** | Reviewer approves/rejects a step w/ comments | Process Street, Monday, Asana | Medium | **Medium–High** (manager sign-off) |
| **Automation rules (trigger→action)** | "When X, do Y" — notify/assign/create | Monday, ClickUp, Trello Butler, Rippling (100+), HiBob | Medium (internal status→assign) / High (full IFTTT) | **Medium** (lightweight internal yes; full engine no) |
| **Reminders / notifications** ⭐ | Email/in-app/Slack nudges for due/overdue/stalled | 360Learning, WorkRamp, Slack, Personio, BambooHR | Medium (`@nestjs/schedule` + BullMQ + email) | **High** (drives completion; competitor gap) |
| **Multi-channel orchestration** (email/push + in-app) | Coordinate in-app steps w/ email/push | Appcues, WalkMe, Whatfix | High (providers + orchestration) | **Medium** |
| **Scheduling / calendar integration** | Auto-schedule intros, check-ins, orientation | HiBob, Rippling | Medium–High (Google/O365 OAuth) | **Medium** (defer) |
| **New-hire check-in surveys (30/60/90)** | Automated pulse/eNPS at milestones | BambooHR, HiBob, Personio | Medium (survey schema + scheduled send) | **Medium–High** (feeds analytics) |
| **Forms / structured data intake** | Collect tax/equipment/profile data | Monday WorkForms, Asana, Coda, Process Street | Medium | **Medium** |
| **AI-assisted authoring** | Draft step copy from a wiki doc; auto-assign | ClickUp Brain, Chameleon, Whatfix, Userpilot, Notion AI | Medium (LLM call) | **Medium** (pairs w/ wiki corpus) |

### D. Engagement & guidance

| Feature | Description | Seen in | Complexity | Usefulness |
|---|---|---|---|---|
| **Personalization by role at first login** | Reflect role back immediately, show tailored path | Notion (strongest), Slack, Figma | Low (role already known) | **High** (near-free, strong first impression) |
| **Empty-state guidance** | Every empty screen = "do this next" prompt | Slack, Linear (best), Notion, GitHub | Low (frontend only) | **Medium** (polish) |
| **Milestone celebration** | Confetti / "You're all set!" on completion | Slack, GitHub badges; mostly absent | Low (event → UI) | **Medium** (cheap retention lever) |
| **Welcome / "meet the team" content** | Welcome messages, team intros, org context | BambooHR, HiBob, Gusto, Personio | Low–Medium | **Medium–High** (fits knowledge hub) |
| **Org chart / directory** | Interactive org chart for orientation | Gusto, HiBob, Workday | Medium (recursive hierarchy) | **Medium** |
| **Resource center / help widget** | Always-available hub of guides/links | Appcues, Userpilot, Chameleon, Whatfix | Low–Medium (reuses wiki) | **High** (knowledge-hub synergy) |
| **Interactive checklist (auto-detected completion)** | Item completes on real action ("connected calendar") | Notion, GitHub, Slack Lists | Medium (event hooks) / Low (manual checkoff) | **Medium–High** |
| **Product tours / tooltips / spotlights** | Guided in-app coachmarks on UI | Figma (best), WalkMe, Whatfix, Intro.js | Medium (Reactour/Shepherd) | **Low–Medium** (onboards onto *app UI*, not the company — tangential) |
| **In-app surveys / NPS** | In-context feedback, NPS scoring | Appcues, Userpilot, Pendo, UserGuiding | Medium | **Medium** |

### E. Quizzes, gamification, social (mostly defer)

| Feature | Description | Seen in | Complexity | Usefulness |
|---|---|---|---|---|
| **Quizzes / knowledge checks** | MCQ/true-false after a step | Moodle (richest), all LMS | Medium (Q/A/attempt + grading) | **Medium** (simple MCQ later; skip banks) |
| **Certifications / certificates** | Issue cert on completion, optional expiry | All LMS | Medium (PDF + recert scheduling) | **Low–Medium** (simple completion record enough) |
| **Badges / achievements** | Award badges for milestones | GitHub (best), all LMS | Low–Medium | **Medium** (pairs w/ celebration; skip Open Badges std) |
| **Points / leaderboards / levels** | XP, ranking, levels | TalentLMS, Docebo, Moodle plugin | Medium–High | **Low** (ranking new hires is counterproductive — skip) |
| **Social / discussion / peer cohorts** | Forums, peer Q&A, co-authoring | 360Learning (flagship), Moodle, Docebo | High (whole subsystem) | **Low–Medium** (a per-step comment thread maybe; full forums no) |

### F. Out of scope (HR-platform territory — High complexity, off-mission)

E-signature (DocuSign-grade), statutory forms (I-9/W-4/tax), offer-letter generation, SaaS/account provisioning (SCIM/OAuth per app), device/MDM provisioning, full IFTTT automation engine. These are where Rippling/Deel/Gusto/Workday win — separate products. If needed, model them as integration "step types" that hand off to a third party (e.g. a `provisioning` step that calls out), not built in-house.

---

## PART 2 — ANALYTICS & METRICS CATALOG

Data-source flag: 🟢 our DB alone · 🟡 our DB + one external join (manager rating, org structure) · 🔴 needs HRIS / payroll / performance / IT.

### 1. Completion metrics — *build first, almost all 🟢 Low*

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **Overall completion rate** | hires done all required ÷ total hires | Low | 🟢 | **High** ← #1 KPI |
| **Step completion rate** | completed step ÷ reached step | Medium | 🟢 | **High** |
| **Completion by role / dept / cohort** | facet overall by role/dept/start-month | Low | 🟢/🟡 | **High** |
| **On-time completion rate** | completed on/before due ÷ total completed | Low | 🟢 | **High** |
| **Overdue rate** | open steps past due ÷ total required | Low | 🟢 | **High** |

Benchmark: healthy overall completion **≥85%**; a core flow **<30%** = serious friction.

### 2. Time metrics

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **Time-to-complete onboarding** | final-step ts − started ts (report **median**) | Low | 🟢 | **High** |
| **Time-per-step** | completed ts − reached ts, per step | Medium | 🟢 | **High** (finds slow steps) |
| **Time-to-first-value** | first-value event − start | Medium | 🟢/🟡 | **High** |
| **Time-to-productivity / ramp** | productivity date − start (÷ role benchmark) | High | 🟡 | **High** (needs milestone def) |
| **Time-to-day-one access** | access-ready − offer-accepted | High | 🔴 | Medium |

Benchmark: structured onboarding cuts ramp 8–12mo → 4–6mo; formal = 34% faster. **Report median, not mean** (right-skewed).

### 3. Engagement metrics — *need the event log*

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **Drop-off / abandonment point** | started, inactive >N days, not complete ÷ started | Medium | 🟢 | **High** |
| **Active-days during onboarding** | distinct active days per hire | Medium | 🟢 | Medium |
| **Content views** | count(content_viewed), unique reach | Medium | 🟢 | Medium |
| **Step revisits** | re-entries of a seen step (unclear instructions) | Medium | 🟢 (append-only) | Medium |
| **Session frequency / stickiness (DAU/MAU)** | sessions ÷ users; DAU÷MAU | Medium | 🟢 | Low (only if onboarding spans weeks) |

Benchmark: healthy funnel loses ~5–10% per step; **>30% drop on one step = redesign it.**

### 4. Outcome / HR metrics — *highest ROI, mostly 🔴 phase 2*

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **30/60/90-day retention** | still employed at milestone ÷ cohort | High | 🔴 | **High** |
| **Early / first-year turnover** | new hires left in window ÷ total | High | 🔴 | **High** |
| **New-hire satisfaction** | avg score / % favorable at 30/60/90 | Low | 🟢 | **High** |
| **New-hire eNPS** | %promoters(9–10) − %detractors(0–6) | Low | 🟢 | **High** |
| **Hiring-manager satisfaction** | avg manager rating at 30/60/90 | Low–Medium | 🟡 | **High** |
| **Performance ramp / quality of hire** | perf rating ÷ threshold; composite index | High | 🔴/🟡 | Medium |
| **Onboarding ROI / turnover cost** | (net benefit − cost) ÷ cost; 50–200% salary | High | 🔴 | Medium (exec) |

Benchmark: median 90-day turnover ≈3.4%; only ~12% of employees say their company onboards well (Gallup); great onboarding → up to 82% higher retention.

### 5. Manager / admin metrics — *operational core, nearly all 🟢*

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **Per-new-hire progress %** | completed required ÷ total required assigned | Low | 🟢 | **High** |
| **Team progress roll-up** | per-manager aggregate (Σ completed ÷ Σ required) | Low | 🟢/🟡 | **High** |
| **Bottleneck step** | step w/ lowest completion × volume × block severity | Medium | 🟢 | **High** |
| **Overdue task count / alerts** | open steps where due < today, per hire/team | Low | 🟢 | **High** |
| **Assignment coverage** | required steps assigned ÷ required defined for role | Low | 🟢 | **High** (catches misconfig) |
| **Manager check-in completion** | done check-ins ÷ scheduled (wk1/30/60/90) | Low–Medium | 🟢/🟡 | **High** |
| **Document/compliance completion** | done mandatory ÷ required + timeliness gate | Medium | 🟢/🔴 | **High** |
| **Buddy assignment rate** | hires w/ buddy ÷ total | Low | 🟢 | Medium |
| **Provisioning / day-one readiness** | provisioning items done ÷ required | High | 🔴 | **High** (phase 2) |

### 6. Quality / funnel metrics

| Metric | Formula | Complexity | Src | Useful |
|---|---|---|---|---|
| **Step-to-step conversion** | completed step N ÷ completed step N−1 | Medium | 🟢 | **High** (where flows stall) |
| **Drop-off rate per step** | 100 − step-to-step conversion | Medium | 🟢 | **High** |
| **Overall funnel conversion** | reached final ÷ entered step 1 (in window) | Medium | 🟢 | **High** |
| **Stall rate per step** | hires w/ time-in-step > threshold ÷ reached | Medium | 🟢 | Medium |
| **Average overdue days / SLA adherence** | Σ(today − due) ÷ overdue count; within-SLA ÷ total | Low–Medium | 🟢 | Medium |
| **Cohort comparison (any metric)** | group by start-month/manager/dept/role/location | Low–Medium | 🟢/🟡 | **High** |

---

## PART 3 — PRIORITIZATION (value vs effort)

### Tier 1 — Build now (Low complexity, High usefulness, on-mission)
Steps · role-based templates (static) · phased steps · **wiki-content linking** · rich text/video/doc content · admin CRUD · per-user completion · **progress %** · due dates (relative-to-hire) · **manager oversight dashboard** · acknowledgement/sign-off · audit trail · buddy assignment · personalization-by-role · auto-enrollment on join.
**Analytics:** overall + step + by-role completion · on-time/overdue · time-to-complete · per-new-hire progress · team roll-up · overdue alerts · assignment coverage · bottleneck step.

> This entire tier is Prisma relational modeling + GraphQL resolvers + Next.js views — **no external integrations**. It's also the exact shape of Hivemind's real `onboarding` module, so it ports cleanly.

### Tier 2 — Fast follow (Medium complexity, high leverage)
Reminders/notifications (job queue) · templates/clone · draft/preview/publish · check-in surveys (→ unlocks satisfaction + eNPS) · resource center (reuse wiki) · milestone celebration + badges · sub-tasks · approvals · lightweight internal automation (status→assign) · AI-assisted authoring.
**Analytics:** drop-off funnel + step-to-step conversion · time-per-step · time-to-first-value · cohort comparison · manager reports/export · compliance/audit reporting · satisfaction + eNPS.

### Tier 3 — Only if demand validates
Linear prerequisites/locking · stop/gating tasks · quizzes (simple MCQ) · interactive auto-completing checklist · empty-state polish · org chart · version control.

### Skip (LMS bloat / off-mission / High effort–Low fit)
SCORM/xAPI · certifications w/ recert · points/leaderboards/levels · full social/forums · skill-gap/ontology · A/B testing of flows · PES/stickiness/churn modeling · product-tour DOM-overlay engine · full IFTTT automation · e-sign/statutory forms/offer letters/SaaS+device provisioning (→ integrate, don't build).

---

## PART 4 — Architecture notes for the build

- **Event log over status column** (see TL;DR) — the single decision that unlocks the analytics roadmap migration-free.
- **Template instantiation:** snapshot the template into each per-user run (Trello/ClickUp model) rather than live-linking (Notion model). Snapshot gives stable per-user state + clean audit — the right call for compliance.
- **`OnboardingFlow → Step → Completion`** graph in Prisma with `targetRoles[]` and per-flow `status` (draft/published).
- **DataLoader** in GraphQL resolvers for manager-dashboard team roll-ups — avoid N+1.
- **`@nestjs/schedule` + BullMQ** for the reminder/overdue scheduler (Tier 2).
- **Tenant scoping at the Prisma layer** (middleware/row-level) on every onboarding model — every aggregation must be tenant-scoped; cohort/portfolio rollups are where tenant-isolation bugs hide.
- **Reuse the wiki module for content** instead of a parallel content store — biggest single leverage point.
- **Closest analog to study:** Process Street's "workflow run" model (role assignments + conditional logic + approvals + stop tasks + audit on recurring runs).

---

## Sources

**HR platforms:** BambooHR ([onboarding](https://www.bamboohr.com/platform/onboarding/)), Rippling ([workflows](https://www.rippling.com/platform/workflows)), Workday Journeys ([use cases](https://commitconsulting.com/blog/workday-journeys-use-cases)), Gusto ([onboarding](https://gusto.com/product/hr/onboarding-software)), Deel ([HR/IT](https://www.deel.com/blog/enhance-hr-efficiency-deel-hr-it/)), Sapling/Kallidus ([tasks & workflows](https://kallidus.zendesk.com/hc/en-us/articles/360018225857), [smart assignment](https://kallidus.zendesk.com/hc/en-us/articles/360018223557)), HiBob ([onboarding](https://www.hibob.com/features/onboarding/)), Personio ([onboarding](https://www.personio.com/product/onboarding/)).

**PM/checklist:** Process Street ([onboarding workflow](https://www.process.st/onboarding-workflow/), [approvals](https://www.process.st/approvals/)), ClickUp ([template](https://clickup.com/templates/employee-onboarding-t-127240584), [automation](https://clickup.com/blog/automation-examples/)), Monday ([onboarding](https://monday.com/blog/project-management/employee-onboarding-template/)), Asana ([template](https://asana.com/templates/employee-onboarding)), Notion ([sub-tasks & dependencies](https://www.notion.com/help/guides/tasks-manageable-steps-sub-tasks-dependencies)), Trello ([Butler](https://blog.trello.com/butler-power-up-trello-automation)), Coda ([onboarding template](https://coda.io/@sweat-equity-ventures/new-employee-onboarding-template)).

**Product adoption:** Pendo ([guidance tools](https://www.pendo.io/pendo-blog/the-top-8-in-app-guidance-tools-in-2025/), [PES](https://support.pendo.io/hc/en-us/articles/360054782691), [funnels](https://support.pendo.io/hc/en-us/articles/360031863292)), Userpilot ([checklists](https://userpilot.com/blog/pendo-vs-appcues-vs-userguiding-for-onboarding-checklists/), [flow logic](https://docs.userpilot.com/in-app-engagement/flows/CE/logic)), Appcues ([concepts](https://docs.appcues.com/getting-started/understanding-appcues-concepts), [KPIs](https://www.appcues.com/blog/user-onboarding-metrics-and-kpis)), Chameleon ([AI onboarding](https://www.chameleon.io/blog/ai-user-onboarding)), WalkMe/Whatfix ([compared](https://userpilot.com/blog/walkme-vs-whatfix/)), Intro.js ([site](https://introjs.com/)).

**LMS / dev tools:** Moodle, TalentLMS, Docebo ([onboarding KPIs](https://www.docebo.com/learning-network/blog/employee-onboarding-kpis/)), 360Learning, Seismic, WorkRamp; Slack/Linear/Notion/GitHub/Figma onboarding flows.

**Metrics authorities (primary):** [AIHR onboarding metrics](https://www.aihr.com/blog/onboarding-metrics/), [AIHR time-to-productivity](https://www.aihr.com/hr-glossary/time-to-productivity/), [Amplitude activation/TTV](https://amplitude.com/glossary/terms/activation-rate), [Pendo stickiness](https://support.pendo.io/hc/en-us/articles/360031864252), [Userpilot checklist benchmarks 2025](https://userpilot.com/blog/onboarding-checklist-completion-rate-benchmarks/), [FullSession onboarding funnel](https://www.fullsession.io/blog/onboarding-funnel-analysis/), [HRBench 90-day turnover](https://www.hrbench.com/resource/learn/90-day-new-hire-turnover), SHRM & Gallup (verify paywalled benchmarks before quoting externally).

*Benchmark figures from vendor/aggregator blogs are directional — verify against SHRM 2025 Benchmarking and Gallup State of the Workplace before quoting externally.*
