# Research: Home Expense Tracker

**Phase**: 0 — Outline & Research  
**Branch**: `001-home-expense-tracker`  
**Date**: 2026-02-26  
**Status**: Complete — all NEEDS CLARIFICATION items resolved

---

## R-001: Frontend Framework

**Question**: Which frontend framework (React 18, Vue 3, Svelte 5) is best for a mobile-first SPA with swipe gestures, floating action buttons, modals, and a list/chart toggle?

**Decision**: Vue 3 + Vite + TypeScript

**Rationale**:
- Vue 3 runtime ~22 KB gzip vs React 18 ~45 KB — meaningful advantage over mobile 4G.
- `@vueuse/core` ships `useSwipe` (iOS Safari-safe via PointerEvents + `touch-action: pan-y`) with no additional package.
- **Vant 4** is a purpose-built mobile-first Vue 3 component library covering: `Popup` (modals), `Tabs` (List/Chart toggle + Setup sub-tabs), `FloatingBubble` (FABs), `PullRefresh`, `Dialog` — matching the spec almost line-for-line.
- Vue 3 `<script setup>` SFCs co-locate template/style/logic, keeping each feature unit compact.

**Alternatives considered**:
- **React 18** — best ecosystem; ~2× Vue's runtime. Viable; not chosen due to bundle weight and Vant's Vue-exclusivity.
- **Svelte 5** — smallest compiled output. Rejected: reached stable Oct 2024; ecosystem too immature for this combination of mobile gestures + charting + modal management.

**Key versions to pin**:
```jsonc
{
  "dependencies": {
    "vue":           "^3.5",
    "vue-router":    "^4.4",
    "pinia":         "^2.3",
    "vant":          "^4.9",
    "@vueuse/core":  "^12.0",
    "chart.js":      "^4.4",
    "vue-chartjs":   "^5.3",
    "lucide-vue-next": "^0.469",
    "dexie":           "^4.0"
  },
  "devDependencies": {
    "vite":                 "^6.1",
    "@vitejs/plugin-vue":   "^5.2",
    "@tailwindcss/vite":    "^4.0",
    "typescript":           "^5.7",
    "vite-plugin-pwa":      "^0.21",
    "vitest":               "^3.0",
    "@playwright/test":     "^1.50"
  }
}
```

---

## R-002: Local Storage

**Question**: Which local storage solution fits a single-device household expense app with relational data, fast queries, and zero backend cost?

**Decision**: IndexedDB via Dexie.js

**Rationale**:
- **No server required.** MVP descopes cross-device sync entirely. All data lives in the browser, eliminating PocketBase, Fly.io, Dockerfile, migrations, and PIN auth.
- **Dexie.js is the canonical IndexedDB wrapper.** Provides a clean, promise-based API; ~24 KB gzip; actively maintained; TypeScript-first.
- **Relational queries via compound indexes.** `db.expenses.where('[month+categoryId]').equals(...)` — monthly list and pie chart aggregations are fast and ergonomic.
- **Persistent by default.** IndexedDB data survives browser close, tab close, and device restart. Data is cleared only by explicit "Clear site data" or uninstalling the PWA on iOS.
- **PWA-compatible.** Works fully offline after first load. No network requests needed for data operations.
- **Scale is trivial.** ~6,000 expense rows ≈ < 1 MB in IndexedDB; queries complete in < 5 ms locally.

**Dexie.js schema pattern**:
```typescript
import Dexie, { type Table } from 'dexie'; // ^4.0

export interface Expense {
  id?: number;
  amount: number;
  categoryId: number;
  paidBy: number;
  date: string;        // ISO date "YYYY-MM-DD"
  month: string;       // derived "YYYY-MM" for fast index
  description?: string;
  created: string;
  updated: string;
}

class AppDB extends Dexie {
  expenses!: Table<Expense>;
  categories!: Table<Category>;
  members!: Table<Member>;

  constructor() {
    super('home-expense-tracker');
    this.version(1).stores({
      expenses:   '++id, month, [month+categoryId], [month+paidBy]',
      categories: '++id, name',
      members:    '++id, name',
    });
  }
}

export const db = new AppDB();
```

**Key version**: `dexie@^4.0`

**Alternatives considered**:
- **PocketBase self-hosted** (previous decision) — eliminated: requires a server, hosting cost/complexity, deployment steps; overkill for single-device MVP.
- **localStorage** — rejected: 5 MB limit; no indexing; synchronous (blocks UI); no relational structure.
- **SQLite via WASM (sql.js / wa-sqlite)** — rejected: complex setup, larger bundle (~1.5 MB), no native browser integration. Valid for a future desktop-grade version.
- **Supabase / Firebase** — eliminated when cross-device sync was descoped.

---

## R-003: Pie Chart Library

**Question**: Which chart library is best for a single pie chart on a 375 px mobile screen with custom hex slice colours and WCAG 2.1 AA accessibility for Vue 3?

**Decision**: Chart.js 4 + vue-chartjs 5

**Rationale**:
- **Lightest tree-shaken pie footprint.** Register only `PieController + ArcElement + Tooltip + Legend` → ~37 KB gzip. Recharts ~52 KB, ECharts ~95 KB.
- **Custom hex colours are trivial.** `backgroundColor: categories.map(c => c.colour)` maps directly.
- **Responsive.** `responsive: true` + `maintainAspectRatio: true` + `width: 100%` wrapper fills 375 px automatically.
- **WCAG 2.1 AA.** Canvas `aria-label` + `role="img"` pattern satisfies SC 1.1.1.
- vue-chartjs is a thin wrapper (<100 lines) maintained in the Chart.js org.

**Tree-shaken registration**:
```typescript
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(PieController, ArcElement, Tooltip, Legend);
```

**Alternatives considered**:
- **Recharts 3** — better SVG accessibility; React-only. Good alternative if React chosen.
- **ECharts 6** — most feature-rich; 2.5× bundle. `svelte-echarts` low adoption.
- **Hand-rolled SVG** — zero deps; ~3–5 dev days. Valid future optimisation.

**Key versions**: `chart.js@^4.4`, `vue-chartjs@^5.3`

---

## R-004: CSS Approach

**Question**: Which CSS approach is best for a mobile-first Vue 3 SPA with modals, tabs, and floating action buttons?

**Decision**: Tailwind CSS v4 + Vant 4 (Vant supplies accessible interactive components; Tailwind handles utility styling)

**Rationale**:
- shadcn/ui (React-only) was eliminated when Vue 3 was chosen. Vant 4 already ships fully-accessible mobile-optimised `Popup`, `Dialog`, `Tabs`, `FloatingBubble`, `PullRefresh` — equivalent to shadcn primitives.
- Tailwind CSS v4 works natively with Vue via `@tailwindcss/vite`; no `tailwind.config.js`; tokens in CSS `@theme` blocks.
- Utility classes keep styles co-located with markup in `<script setup>` SFCs.
- CSS Modules rejected: requires hand-rolling focus-trap, ARIA, keyboard nav for interactive components.

**Setup** (2 lines):
```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';
export default { plugins: [vue(), tailwindcss()] };
```
```css
/* src/style.css */
@import "tailwindcss";
```

**Key version**: `tailwindcss@^4.0` via `@tailwindcss/vite@^4.0`

---

## R-005: Icon Set for Categories

**Decision**: Lucide icons (`lucide-vue-next`) — tree-shakeable, 24 px stroke SVG, 1,400+ icons covering all household expense categories.

**Version**: `lucide-vue-next@^0.469`

---

## Summary — All NEEDS CLARIFICATION Resolved

| Research Item | Decision | Key Packages |
|---|---|---|
| Frontend framework | Vue 3 + Vite + TypeScript | `vue@^3.5`, `pinia@^2.3`, `vue-router@^4.4` |
| Mobile UI components | Vant 4 | `vant@^4.9`, `@vueuse/core@^12.0` |
| CSS styling | Tailwind CSS v4 | `@tailwindcss/vite@^4.0` |
| Icons | Lucide | `lucide-vue-next@^0.469` |
| Pie chart | Chart.js + vue-chartjs | `chart.js@^4.4`, `vue-chartjs@^5.3` |
| Local storage | IndexedDB via Dexie.js | `dexie@^4.0` |
| Hosting (frontend) | Any static host (GitHub Pages, Cloudflare Pages, Netlify) | none |
| Auth | None (MVP: no auth required) | — |
| Testing | Vitest + Playwright | `vitest@^3`, `@playwright/test@^1.50` |
| PWA (optional) | vite-plugin-pwa | `vite-plugin-pwa@^0.21` |
