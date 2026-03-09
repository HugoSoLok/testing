# Quickstart: Home Expense Tracker

**Branch**: `001-home-expense-tracker`  
**Date**: 2026-02-26 (updated 2026-03-04)  
**Stack**: Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Vant 4 + Dexie.js (IndexedDB)

---

## Prerequisites

- Node.js 20+ and npm 10+
- A modern browser (Chrome 90+, Safari 16.4+, Firefox 90+)
- No server, no account, no deployment required

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd <repo-name>
git checkout 001-home-expense-tracker

npm install
```

---

## 2. Local Development

```bash
npm run dev
# → http://localhost:5173
```

Open on mobile (same network):
```bash
npm run dev -- --host
# → http://192.168.x.x:5173  (use your machine's LAN IP on your phone)
```

No environment variables are required. The app stores all data in the browser's IndexedDB automatically.

---

## 3. Run Tests

```bash
# Unit tests (Vitest)
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests (Playwright) — requires dev server running
npm run dev &
npm run test:e2e
```

---

## 4. Build and Deploy

The app is a static SPA — deploy the built output to any free static host.

```bash
npm run build
# Output: dist/
```

**Free static hosting options** (no server, no cost):
```bash
# GitHub Pages:
git push origin main  # configure Pages in repo settings to serve dist/

# Cloudflare Pages:
npx wrangler pages deploy dist --project-name home-expense-tracker

# Netlify:
npx netlify deploy --prod --dir dist
```

> Data is stored in the user's browser (IndexedDB). Changing the hosting URL changes the origin, which means IndexedDB data from the old URL is not accessible. Stick to one stable URL for production.

---

## 5. Install as PWA (Add to Home Screen)

1. Open the app URL in **Chrome (Android)** or **Safari (iOS 16.4+)**.
2. Android: tap the browser menu → "Add to Home screen".
3. iOS: tap Share → "Add to Home Screen".

The app will appear as a standalone icon and launch without the browser chrome.

---

## 6. Project Structure

```text
.
└── src/
    ├── main.ts
    ├── App.vue
    ├── router/
    │   └── index.ts                # vue-router: /expense, /setup
    ├── stores/
    │   ├── expenses.ts             # Pinia: monthly expense list + CRUD (Dexie)
    │   ├── categories.ts           # Pinia: category list + CRUD (Dexie)
    │   └── members.ts              # Pinia: family members + CRUD (Dexie)
    ├── pages/
    │   ├── ExpensePage.vue         # Expense page (List/Chart toggle, FABs)
    │   └── SetupPage.vue           # Setup page (Members + Categories sub-tabs)
    ├── components/
    │   ├── expense/
    │   │   ├── ExpenseList.vue       # Scrollable month list
    │   │   ├── ExpenseRow.vue        # Single row (icon + amount)
    │   │   ├── ExpenseDetail.vue     # Detail popup (all fields + Edit/Delete)
    │   │   ├── ExpenseForm.vue       # New/Edit form popup
    │   │   └── MonthNav.vue          # Month header + swipe handler
    │   ├── chart/
    │   │   └── CategoryPieChart.vue  # Chart.js pie chart wrapper
    │   ├── split/
    │   │   └── SplitPopup.vue        # Split calculator popup
    │   └── setup/
    │       ├── CategorySetup.vue     # Category list + add/edit/delete
    │       └── MemberSetup.vue       # Member list + add/rename/remove
    ├── lib/
    │   ├── db.ts                   # Dexie.js database singleton + schema
    │   └── split.ts                # Net-settlement calculation logic
    └── style.css                   # @import "tailwindcss" + @theme tokens
tests/
├── unit/
│   └── split.test.ts               # Split calculator logic unit tests
└── e2e/
    ├── expense.spec.ts             # Record + view + edit + delete
    └── split.spec.ts               # Split calculator scenarios
```
---

## 7. Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Type check
npm run typecheck
```

> **Data note**: To reset all app data during development, open DevTools → Application → Storage → IndexedDB → `home-expense-tracker` → right-click → Delete database.