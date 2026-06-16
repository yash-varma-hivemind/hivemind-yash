# Yash — Onboarding & Learning Path

Welcome to Hivemind! This document is your starting point. It explains the technologies we use, how they relate to what you already know, the order in which to learn them, and how your day-to-day work will fit into the bigger product.

You will work in **your own code repository** (a separate copy of the project, called `hivemind-yash`). You build features there, and later we copy ("port") the good parts into the main Hivemind product. Working in a separate repository keeps things simple for you and protects the main codebase while you are learning.

- **Commitment:** 20 hours per week, for 6 weeks.
- **Your repository:** `hivemind-yash` — it's yours to experiment in; we merge selected work upstream into the main product.
- **Your goal:** ship one complete feature, end to end — the database, the API, and the web page — using the same patterns and conventions we use in the real product.

> **A note on the jargon.** This document uses some technical terms. The first time an important one appears it is explained in plain language, and there is a full **Glossary** at the bottom. If anything is unclear, that's expected on day one — ask, and we'll walk through it.

---

## 1. The technologies we use — and how they map to what you already know

You come from a **Java / Spring Boot / Angular** background. The good news: our stack (the set of technologies we use) is the JavaScript/TypeScript equivalent of that same world. The *ideas* are the same — you are mostly learning new words and new syntax for concepts you already understand.

Here is each technology, what it does, and the closest thing you already know:

| What Hivemind uses | What it does, in plain terms | What you already know | The mental bridge |
|---|---|---|---|
| **NestJS** | The framework that organises our backend (server-side) code | Spring Boot | NestJS is "Spring for JavaScript." It uses the same ideas: dependency injection, modules, and annotations/decorators. If you know Spring, you will feel at home fast. |
| **TypeScript (on Node.js)** | The programming language for both backend and frontend | TypeScript (you used it with Angular) | Same language you already know. What's new is running it on **Node.js** (the JavaScript runtime) instead of in the browser, plus a package manager called **pnpm** (like Maven/Gradle, but for JavaScript). |
| **Prisma** | The tool that talks to the database for us (an "ORM") | JPA / Hibernate | You describe your data in one schema file; Prisma creates the database tables and gives you type-safe code to read and write data. It is simpler and more predictable than Hibernate. |
| **GraphQL (with Apollo)** | How the frontend asks the backend for data | REST APIs (you built these in Spring) | Instead of many REST endpoints, there is one endpoint and a typed "menu" (schema) of what you can ask for. This is the **biggest new concept** for you — spend real time here. |
| **PostgreSQL** | The database that stores all the data | PostgreSQL ✅ | No change. You already know this. |
| **Docker / Docker Compose** | Runs the database (and other services) on your machine in a consistent way | Docker / Kubernetes ✅ | You are ahead of most people here. Compose just starts the services we need locally. |
| **Next.js (App Router) + React** | The framework for building the web pages users see | Angular | Same job as Angular (building interactive web pages), but a different style: components written in JSX, "hooks" for state. This is the **second-biggest learning curve** for you. |
| **Tailwind CSS + shadcn/ui** | How we style the look of the web pages | Bootstrap | Instead of pre-made Bootstrap components, you compose small utility classes. shadcn/ui gives you ready-made building blocks (buttons, cards) that you style. |
| **Nx monorepo + pnpm** | Keeps the backend and frontend together in one organised repository | Maven/Gradle multi-module project | One repository containing several "apps" and shared code. The same idea as a multi-module Java project. |

### What you do NOT need to learn (we deliberately leave it out)

The real product also has login/security (Keycloak), multi-company data separation (multi-tenancy), background jobs, payments (Stripe), cloud file storage, and translations. **You can ignore all of that.** Your repository uses a simple stand-in for the logged-in user (explained in `TASKS.md`) so you can focus on building features. Leaving these out keeps you focused and makes it easy to copy your work into the main product later.

---

## 2. Learning Path (ordered by what's least familiar to you, first)

Work through these in order. Each step ends with a small, concrete checkpoint so you can confirm it has clicked before moving on. From step 3 onward, you can start the real feature work in `TASKS.md` in parallel with the learning.

### Step 0 — Node.js, TypeScript, and pnpm (the basics of the environment)
- **What you're learning:** how to run TypeScript code outside the browser, using Node.js; and how `pnpm` installs and runs packages (the equivalent of Maven dependencies and goals).
- Details: Node.js version 20 or newer, `pnpm` (not the older `npm`), the `package.json` file (lists dependencies and commands), and ES modules (the modern way JavaScript files import each other).
- **Checkpoint:** write and run a small TypeScript script with `pnpm` that prints a message to the screen.

### Step 1 — NestJS (this is your fastest win — it mirrors Spring)
- **What you're learning:** how our backend is structured. NestJS uses the same patterns as Spring Boot, so lean on that knowledge.
- Concepts: **Modules** (group related code), **Providers/Services** (`@Injectable()` — your business logic, injected where needed), **Guards** (run before a request, like Spring filters/interceptors — used for permission checks), **Pipes** (validate/transform incoming data), and **Exception filters** (turn errors into responses).
- **Validation:** we use libraries called `class-validator` and `class-transformer` to check incoming data — the equivalent of Java's Bean Validation annotations.
- Read: the official NestJS documentation (the "Overview" and "Fundamentals" sections) — https://docs.nestjs.com
- **Checkpoint:** build a small NestJS module with one service, and write a unit test for it.

### Step 2 — Prisma and PostgreSQL in Docker (you already know the database)
- **What you're learning:** how we define data and talk to the database. You know PostgreSQL and Docker already, so this is mostly learning Prisma itself.
- Concepts: the `schema.prisma` file (where you describe your tables and how they relate), **migrations** (versioned changes to the database structure — `prisma migrate`), and the generated, type-safe **Prisma client** (the code you call to read/write data).
- Read: the Prisma documentation ("Getting Started" and "Prisma Schema") — https://www.prisma.io/docs
- **Checkpoint:** define two related tables, apply the migration, and read/write them from a NestJS service.

### Step 3 — GraphQL, "schema-first", with Apollo and NestJS (the main new idea — go slowly)
- **What you're learning:** how the frontend and backend talk. This is the most unfamiliar concept coming from REST, so give it time.
- **"Schema-first"** means: you first write the API definition (the schema, in a language called SDL — Schema Definition Language), and then write the code (**resolvers**) that fulfils it. We do **not** use the alternative "code-first" approach — please stick to schema-first so your work matches the main product.
- Concepts: **Queries** (read data), **Mutations** (change data), types and inputs (the shapes of data), resolver arguments, and the request **context** (where the current user's information lives).
- Read: https://graphql.org/learn and the NestJS GraphQL guide (the schema-first parts) — https://docs.nestjs.com/graphql/quick-start
- **Checkpoint:** expose one query and one mutation backed by Prisma, and try them in the Apollo "sandbox" (an in-browser tool for testing the API).

### Step 4 — Next.js (App Router) and React (your biggest frontend shift: Angular → React)
- **What you're learning:** how to build the web pages. React solves the same problems as Angular but with a different mental model, so plan to spend real time here.
- React basics: components, props (inputs to a component), `useState`/`useEffect` (managing data and side-effects — "hooks"), rendering lists, and controlled form inputs.
- **Angular → React translations:** Angular services → React hooks/context; Angular's `*ngFor` → JavaScript's `.map()`; Angular two-way binding → React "controlled" inputs; RxJS streams → `async/await` plus simple state.
- Next.js App Router: file-based routing in the `app/` folder, the difference between **server components** and **client components** (`"use client"`), shared layouts, and how data is fetched.
- Styling: Tailwind utility classes and shadcn/ui components (see `docs/theme/` for our colours and setup).
- Read: https://react.dev/learn and https://nextjs.org/docs/app
- **Checkpoint:** build a page that lists data from your GraphQL API, plus a form that changes that data.

### Step 5 — The typed GraphQL client (a convenience — learn it when you reach it)
- **What you're learning:** a tool called **GraphQL Codegen** that reads your API and automatically generates type-safe code for the frontend to call it — so the frontend and backend can never drift out of sync.
- **Checkpoint:** replace one hand-written API call with a generated, typed one.

---

## 3. Day-One self-rating (please fill this in during onboarding)

Rate yourself from 1 (never used it) to 5 (confident). This simply helps us skip what you already know and spend more time where it will help most.

| Skill | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Node.js / pnpm |  |  |  |  |  |
| NestJS |  |  |  |  |  |
| Prisma |  |  |  |  |  |
| GraphQL (schema-first) |  |  |  |  |  |
| React |  |  |  |  |  |
| Next.js App Router |  |  |  |  |  |
| Tailwind / shadcn |  |  |  |  |  |
| Docker Compose (for local development) |  |  |  |  |  |

---

## 4. Setting up your computer for development

Your repository includes a `docker-compose.yml` file that runs **only PostgreSQL** (the database) — none of the heavier services from the main product. The commands below start everything you need:

```bash
pnpm install          # download all the project's dependencies
docker compose up -d  # start the PostgreSQL database in the background
pnpm db:migrate       # create/update the database tables (Prisma migrations)
pnpm dev              # start both the backend (api) and frontend (web)
```

Once running, you'll have:
- **Backend API:** NestJS + GraphQL, at `http://localhost:3000/graphql`
- **Frontend website:** Next.js, at `http://localhost:4200` (or whatever port is configured)
- **Database:** PostgreSQL, running inside Docker

---

## 5. Conventions (please follow these — they keep your code easy to merge later)

These are the house rules. Following them is what lets us copy your work into the main product quickly and without surprises.

- **Use schema-first GraphQL only.** Write the API definition (SDL) first, then the code (resolvers). Don't use the "code-first" style.
- **Validate every input.** Use `class-validator` rules on incoming data so bad data is rejected early.
- **Always get the current user through the provided "seam."** A small helper called `@CurrentUser()` gives you the logged-in user. Never read user information directly from the raw request. This single, consistent point is the one thing we swap out when connecting your work to the real login system. (Full explanation in `TASKS.md`.)
- **One feature = one complete vertical slice.** A finished feature includes everything top to bottom: the database tables, the service logic, the API (resolver + schema), and the web page. Keep each feature's code together and self-contained.
- **Commit messages:** use the "Conventional Commits" style — short prefixes like `feat:` (new feature), `fix:` (bug fix), `chore:` (housekeeping). Keep each change ("PR" = pull request, a proposed set of changes) small and focused.
- **Write tests:** unit-test your services, and include at least one end-to-end test per feature (a test that exercises the whole flow).
- **"Definition of Done"** — a feature is finished only when: the database migration is applied · the API (resolver + schema) exists · inputs are validated · you've tested both the normal case and at least one error case · the web page displays and can change the data · and your PR description includes screenshots.

---

## 6. How we'll work together

- **Daily check-in:** a short written update — what you did, and anything blocking you — in our shared channel.
- **End of each week:** a brief demo of whatever is working.

Your actual task list lives in **`TASKS.md`**.

---

## Glossary (plain-language definitions)

- **Backend / frontend:** the backend is the server-side code and database; the frontend is the website the user sees and clicks.
- **Stack:** the full set of technologies used in a project.
- **Repository (repo):** a folder of code tracked by Git (version control).
- **Framework:** a pre-built structure that organises your code (e.g. NestJS, Next.js).
- **API:** the way the frontend (or other programs) request data and actions from the backend.
- **REST vs GraphQL:** two styles of API. REST uses many separate URLs; GraphQL uses one endpoint with a typed menu of available data.
- **Schema:** a formal definition of the shape of data (for the database, or for the GraphQL API).
- **Resolver:** the backend code that fulfils a specific GraphQL query or mutation.
- **Query / Mutation:** a GraphQL request to *read* data (query) or to *change* data (mutation).
- **ORM:** a tool that lets you work with database data as normal code objects (Prisma is our ORM).
- **Migration:** a recorded, repeatable change to the database structure.
- **Dependency injection (DI):** a pattern where the framework supplies the objects your code needs, instead of you creating them — central to both Spring and NestJS.
- **Decorator / annotation:** a label on code (like `@Injectable()`) that tells the framework how to treat it.
- **Component (React):** a reusable piece of user interface.
- **Hook (React):** a function like `useState` that lets a component remember data or react to changes.
- **Monorepo:** a single repository containing multiple related apps and shared code.
- **Multi-tenancy:** keeping different customers' data fully separated within one system (we leave this out of your repo).
- **Port (verb):** to copy/adapt code from one repository into another (here, from yours into the main product).
- **PR (pull request):** a proposed set of code changes, reviewed before merging.
- **CI/CD:** automated building, testing, and deployment of code.
