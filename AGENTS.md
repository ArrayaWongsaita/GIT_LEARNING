# DevNest Agent Guide

This document is the primary working contract for AI/agents contributing to this repository.
Read this file before making any code changes.

## 0) Agent Onboarding (Required Before Coding)

1. Read this `AGENTS.md` fully.
2. Inspect project scripts and dependencies in `package.json`.
3. Inspect routing entry points:
   - `src/App.tsx`
   - `src/App.route.tsx`
4. Inspect feature architecture under:
   - `src/features/*`
   - `src/common/*` for app-wide infrastructure that is not lesson-specific
5. Confirm core implementation style:
   - feature constants/pages/routes
   - common infrastructure/hooks/providers
   - shared components/constants/types

## 1) Core Architecture

- Frontend-only application (React + Vite + TypeScript).
- Feature-based organization under `src/features/<feature-name>`.
- App-wide infrastructure that should not live inside a lesson feature belongs in `src/common/*`.
- Shared building blocks under `src/shared/*`.
- Keep feature concerns isolated; do not mix unrelated lesson/domain logic in a single feature module.

## 2) Required Route and Feature Conventions

When adding or updating lesson/feature pages, follow this flow:

1. Define/extend per-feature path helpers in `*.path.constant.ts`.
2. Register/adjust feature routes in `*.routes.tsx`.
3. Wire routes into `src/App.route.tsx`.
4. Keep central route references in `src/shared/constants/routes/public.constant.ts`.
5. Keep lesson metadata synchronized in `src/features/lesson/constants/gitLesson.constant.ts`.
6. Keep sidebar navigation synchronized with route changes using each feature sidebar constant and `src/shared/components/sidebars/Main.sidebar.tsx`.

Rules:

- Prefer `PUBLIC_ROUTE` and feature path helpers for navigation targets.
- Avoid hardcoded route strings when route constants/helpers exist.
- Feature route files should remain scoped to their own feature.

## 3) Shared Components and Reuse Rules

Prefer existing shared components before building new UI primitives:

- Command rendering and copy UX:
  - `src/shared/components/command/CommandBlock.tsx`
- Setup guide UI:
  - `src/shared/components/setup-guide/SetupGuideHeader.tsx`
  - `src/shared/components/setup-guide/SetupGuideStepCard.tsx`
- UI primitives:
  - `src/shared/components/ui/*` (shadcn-based)
- Sidebar/navigation components:
  - `src/shared/components/sidebars/*`

Guidelines:

- Add feature-specific composition in `src/features/*`.
- Add app-wide providers, navigation infrastructure, and cross-feature runtime concerns in `src/common/*`.
- Add cross-feature reusable elements in `src/shared/components/*`.
- Reuse existing types in `src/shared/types/*` when appropriate.

## 4) Navigation and UX Rules

- Keep app router wrapped with `TransitionNavigateProvider` in `src/App.tsx`.
- Import the provider from `src/common/transitionNavigate/components/TransitionNavigate.provider`.
- Prefer transition-aware navigation patterns where applicable.
- Keep lesson registry (`GIT_LESSONS`), sidebars, and actual routes consistent.
- Preserve current layout structure using `MainLayout` unless a deliberate architecture change is requested.

## 5) Coding and Content Rules

- Keep lesson content and static teaching data in feature constants files.
- For lesson hands-on practice, prefer a dedicated `Lab Collection` section at the end of the page instead of a long flat `Mini Lab` list when the lesson has multiple scenarios.
- Store lab definitions in feature constants, not inline JSX in the page component.
- Prefer Accordion-based lab presentation for multi-scenario lessons:
  - use shadcn `Accordion`
  - keep items collapsed by default
  - show summary metadata in the trigger when available
- When a lesson lab grows beyond a short linear walkthrough, move the lab renderer into a feature-local component under `src/features/<feature>/components/*`.
- Recommended lab item shape for richer lessons:
  - `title`
  - `summary`
  - `difficulty`
  - `focus`
  - `task`
  - `commands`
  - `checkpoint`
  - optional `notes`
- Reuse existing command copy UX with `src/shared/components/command/CommandBlock.tsx` for all lab commands.
- Use TypeScript strict style; avoid bypassing types with unsafe casts unless absolutely necessary.
- Use alias imports (`@/*`) consistently for `src` paths.
- Keep module naming aligned with existing conventions:
  - `*.path.constant.ts`
  - `*.routes.tsx`
  - `*.page.tsx`
  - `*.constant.ts`
- Do not introduce backend/DB assumptions in this project guide:
  - no Prisma rules
  - no server actions
  - no `src/env/server.ts` pattern requirements

## 6) Build and Validation Gate

After all implementation changes are complete, always run a build once before handoff.

Before closing work, run:

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`

The task is considered complete only when both commands pass and route/content changes remain consistent across:

- feature path constants
- feature route files
- `PUBLIC_ROUTE`
- `GIT_LESSONS`
- sidebar lesson links

## 7) Change Safety Checklist

Before finishing any feature/lesson change, verify:

1. Added/updated pages are reachable from router configuration.
2. Sidebar links point to valid paths.
3. Lesson registry entries (`GIT_LESSONS`) reference valid paths and metadata.
4. Shared components were reused where possible before adding new primitives.
5. No documentation/code references to non-existent backend folders or server-side patterns were introduced.

## 8) Final Command Checklist

ต้องผ่านอย่างน้อยคำสั่งตรวจหลักก่อนปิดงาน และถ้ามีการแก้ implementation ให้รัน build ด้วย:

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`
