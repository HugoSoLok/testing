# Implementation Plan: Home Expense Tracker

**Branch**: `001-home-expense-tracker` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-home-expense-tracker/spec.md`

## Summary

A mobile-first web application (320–480 px viewport) for a household to record shared expenses on a single device, view monthly totals with a category pie chart, and calculate who owes whom via a net-settlement split calculator. All data is stored locally in the browser using IndexedDB (Dexie.js); no backend, no authentication, and no network connectivity are required. The frontend is a single-page app with two pages (Expense, Setup) served as a Progressive Web App from any static host.

## Technical Context

**Language/Version**: TypeScript 5.7 (frontend only; no backend)
**Primary Dependencies**: Vue 3.5 + Vite 6.1 + Vant 4.9 (mobile UI) + @vueuse/core 12 (swipe) + Chart.js 4.4 + vue-chartjs 5.3 (pie chart) + Tailwind CSS v4 + lucide-vue-next 0.469 + Dexie.js 4.0 (IndexedDB)  
**Storage**: IndexedDB via Dexie.js (browser-local, no server); data scoped to origin + browser  
**Testing**: Vitest 3 (unit, ≥ 80 % coverage) + Playwright 1.50 (e2e)  
**Target Platform**: Mobile web browser — Chrome/Safari on iOS & Android; 375 px reference width (320–480 px range); installable as PWA  
**Project Type**: Frontend-only SPA; deployed as static files to any free static host (GitHub Pages, Cloudflare Pages, Netlify)  
**Performance Goals**: List + chart render < 1 s on month navigation; split result < 1 s; form write < 100 ms (local); Lighthouse TTI ≤ 3 s  
**Constraints**: No network required; mobile viewport 320–480 px; fully offline-capable after first load  
**Scale/Scope**: 1 device; ~100 expense records/month; indefinite history

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality | Linting + static analysis configured; no dead code committed; all public APIs documented | ✅ PASS | Will be enforced via ESLint + TypeScript strict mode in project setup |
| II. Testing Standards (NON-NEGOTIABLE) | TDD: tests written before implementation; ≥ 80 % unit coverage on changed code; integration tests for primary user journeys; contract tests for storage layer operations | ✅ PASS | Vitest for unit; Playwright for e2e flows; contract tests for all Dexie storage operations |
| III. UX Consistency | WCAG 2.1 AA; consistent error/loading/success patterns; no component duplication; design review for multi-screen changes | ✅ PASS | Single shared component library within the SPA; consistent feedback patterns specified in FR-006/007 |
| IV. Performance Requirements | API p95 ≤ 200 ms; TTI ≤ 3 s; no regression ≥ 10 % | ✅ PASS | SC-002 (list+chart < 1 s), SC-003 (split < 1 s) directly encode performance budgets; Lighthouse CI to enforce TTI |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.ts
    ├── App.vue
    ├── style.css                 # Tailwind CSS v4 @theme tokens + Vant CSS vars
    ├── router/
    │   └── index.ts              # /expense, /setup routes
    ├── stores/
    │   ├── expenses.ts           # Pinia — monthly read/write via Dexie
    │   ├── categories.ts         # Pinia — category list + CRUD
    │   └── members.ts            # Pinia — family_members list + CRUD
    ├── pages/
    │   ├── ExpensePage.vue       # Main screen (list/chart toggle + month nav)
    │   └── SetupPage.vue         # Category + member management
    ├── components/
    │   ├── expense/
    │   │   ├── ExpenseList.vue   # Scrollable list
    │   │   ├── ExpenseRow.vue    # Single row: colour icon + amount
    │   │   ├── ExpenseDetail.vue # Popup with all fields + description
    │   │   ├── ExpenseForm.vue   # Add / edit form (Vant popup sheet)
    │   │   └── MonthNav.vue      # ← Month Year → header
    │   ├── chart/
    │   │   └── CategoryPieChart.vue  # Chart.js 4 pie via vue-chartjs 5
    │   ├── split/
    │   │   └── SplitPopup.vue    # Vant Popup — fair share + net settlement
    │   └── setup/
    │       ├── CategorySetup.vue  # Colour/icon picker + CRUD
    │       └── MemberSetup.vue    # Name list + CRUD
    └── lib/
        ├── db.ts                 # Dexie.js database singleton + schema
        └── split.ts              # Pure split-calculator (unit-tested)

frontend/tests/
├── unit/
│   └── split.test.ts             # Vitest — split.ts edge cases
└── e2e/
    ├── expense.spec.ts           # Playwright — add/edit/delete + month nav
    └── split.spec.ts             # Playwright — split popup settlement values
```

**Structure Decision**: Frontend-only web application. No `backend/` directory. All data is stored in the browser via Dexie.js (IndexedDB). The compiled static assets (`dist/`) are deployed to any free static host.

## Complexity Tracking

No constitution violations. All four principles pass (see Constitution Check above). This table is not applicable for this feature.
