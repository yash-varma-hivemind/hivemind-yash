# HiveMind Onboarding Porting and Demo Guide

## Overview

This project includes an end-to-end onboarding feature for employees, managers, and admin/manager users.

The onboarding feature allows:

- Employees to view and complete their onboarding checklist
- Managers to view team onboarding progress
- Managers to assign onboarding roles
- Admin/manager users to create, edit, delete, and reorder onboarding steps
- The frontend to use type-safe GraphQL operations generated through GraphQL Codegen

## Tech Stack

- Nx monorepo
- NestJS API
- GraphQL
- Prisma
- PostgreSQL
- Next.js web app
- Docker Compose
- GraphQL Codegen

## Setup

Install dependencies:

```bash
pnpm install