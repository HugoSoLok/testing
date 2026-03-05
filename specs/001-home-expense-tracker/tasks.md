# Tasks: Home Expense Tracker

**Input**: Design documents from `/specs/001-home-expense-tracker/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Stack**: Vue 3.5 + Vite 6.1 + TypeScript 5.7 + Vant 4.9 + @vueuse/core 12 + Chart.js 4.4 + vue-chartjs 5.3 + Tailwind CSS v4 + lucide-vue-next 0.469 + Dexie.js ^4.0 (IndexedDB)  
**Tests**: No test tasks unless explicitly requested. Unit tests for `split.ts` are required (pure logic). Playwright e2e tests are deferred to the Polish phase.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task belongs to (US1–US7)
- Paths are relative to repo root; all source is under `frontend/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the frontend project with all tooling configured and ready for feature work.

- [X] T001 Initialize Vite + Vue 3 + TypeScript project in `frontend/` (npm create vite@latest with vue-ts template)
- [X] T002 [P] Install production dependencies (Vant 4, @vueuse/core, Chart.js, vue-chartjs, lucide-vue-next, Dexie.js, Pinia, vue-router) in `frontend/package.json`
- [X] T003 [P] Install and configure Tailwind CSS v4 via `@tailwindcss/vite` plugin; add `@theme` tokens and Vant CSS variable overrides in `frontend/src/style.css`
- [X] T004 [P] Configure TypeScript strict mode and path aliases in `frontend/tsconfig.json`
- [X] T005 [P] Configure ESLint with Vue 3 + TypeScript rules in `frontend/eslint.config.js`
- [X] T006 [P] Configure Vitest with coverage (≥ 80%) in `frontend/vite.config.ts`; add `@vitest/coverage-v8`
- [X] T007 [P] Configure Playwright 1.50 in `frontend/playwright.config.ts` targeting localhost dev server
- [X] T008 Set up Vue Router with `/expense` (default) and `/setup` routes in `frontend/src/router/index.ts`
- [X] T009 Bootstrap `main.ts` with Pinia, Vue Router, and global Vant registration; mount app in `frontend/src/main.ts`

**Checkpoint**: `npm run dev` starts the dev server; `npm run lint` passes; `npm run test:unit` and `npm run test:e2e` commands are wired in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dexie.js database layer, TypeScript types, seed data, and Pinia store scaffolds that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Define TypeScript interfaces `Member`, `Category`, `Expense` per `contracts/api.md` in `frontend/src/lib/db.ts`
- [X] T011 Implement `AppDB` Dexie class with `version(1).stores(...)` schema (expenses, categories, members with compound indexes) in `frontend/src/lib/db.ts`
- [X] T012 Implement `seedIfEmpty()` first-launch function (seed 2 members + 7 categories if tables are empty) in `frontend/src/lib/db.ts` per `contracts/api.md` seed section
- [X] T013 [P] Create Pinia `expenses` store scaffold with `currentMonth` state, `expenses` list, and action stubs in `frontend/src/stores/expenses.ts`
- [X] T014 [P] Create Pinia `categories` store scaffold with `categories` list and action stubs in `frontend/src/stores/categories.ts`
- [X] T015 [P] Create Pinia `members` store scaffold with `members` list and action stubs in `frontend/src/stores/members.ts`
- [X] T016 Create `App.vue` with Vant bottom `<van-tabbar>` (Expense / Setup tabs) and `<router-view>` in `frontend/src/App.vue`

**Checkpoint**: App renders with tab bar; Dexie opens cleanly in browser DevTools (Application → IndexedDB shows `home-expense-tracker` database); seed data is present on first launch; Pinia devtools show all three stores

---

## Phase 3: User Story 1 — Record a New Expense (Priority: P1) 🎯 MVP

**Goal**: A user can tap "+", fill in an expense form, and see the new record appear in the current-month list immediately. Data persists after a browser refresh.

**Independent Test**: Open the app, tap the new-record "+" button, fill in amount, category, Paid by, and date, then submit. The expense row appears in the list showing the category colour icon and the formatted amount. Refresh the browser — the record is still present.

### Implementation for User Story 1

- [X] T017 [US1] Implement `loadExpenses(month)` and `addExpense(data)` actions in `frontend/src/stores/expenses.ts` (DB read: filter by `month` index, sort date desc; DB write: round amount to 2 d.p., derive `month` field, set timestamps)
- [X] T018 [P] [US1] Implement `loadCategories()` action in `frontend/src/stores/categories.ts` (Dexie `orderBy('name').toArray()`)
- [X] T019 [P] [US1] Implement `loadMembers()` action in `frontend/src/stores/members.ts` (Dexie `orderBy('name').toArray()`)
- [X] T020 [US1] Implement `ExpenseForm.vue` — Vant popup sheet with fields: amount (required, number input), category (required, `<van-picker>`), Paid by (required, `<van-picker>`), date (required, `<van-date-picker>`, defaults to today), description (optional, text area); client-side validation (required fields, amount > 0); `add` mode only at this stage in `frontend/src/components/expense/ExpenseForm.vue`
- [X] T021 [US1] Implement `ExpenseRow.vue` — renders category colour icon (Lucide, coloured) and `$X.XX` formatted amount; no other text visible on the row in `frontend/src/components/expense/ExpenseRow.vue`
- [X] T022 [US1] Implement `MonthNav.vue` — displays `← Month YYYY →` header with left/right tap navigation emitting `prev`/`next` events in `frontend/src/components/expense/MonthNav.vue`
- [X] T023 [US1] Implement `ExpenseList.vue` — scrollable list rendering `ExpenseRow` components for the current store expenses list in `frontend/src/components/expense/ExpenseList.vue`
- [X] T024 [US1] Implement `ExpensePage.vue` — composes `MonthNav`, `ExpenseList`, monthly total display, and floating "+" FAB (bottom-right overlay) that opens `ExpenseForm`; calls `loadExpenses`, `loadCategories`, `loadMembers` on mount and on month change in `frontend/src/pages/ExpensePage.vue`

**Checkpoint**: User Story 1 fully functional — record a new expense from form to list, refresh browser and data persists

---

## Phase 4: User Story 2 — View and Navigate Monthly Expenses (Priority: P2)

**Goal**: The user can see all current-month expenses in a sorted list with a total, then swipe or tap to navigate to previous/next months.

**Independent Test**: With at least two expenses recorded in different months, the current-month list shows only current-month records with the correct total; swiping or tapping the arrows changes the month and updates the list and total; navigating to an empty month shows the empty-state message and total $0.00.

### Implementation for User Story 2

- [ ] T025 [US2] Add `monthlyTotal` computed getter to `frontend/src/stores/expenses.ts` (sum of `amount` for current `expenses` list)
- [ ] T026 [US2] Implement month navigation actions `goToPreviousMonth()` and `goToNextMonth()` in `frontend/src/stores/expenses.ts` (update `currentMonth`, re-run `loadExpenses`)
- [ ] T027 [US2] Wire `@vueuse/core` `useSwipe` gesture on the expense list area in `ExpensePage.vue` — swipe right calls `goToPreviousMonth`, swipe left calls `goToNextMonth` in `frontend/src/pages/ExpensePage.vue`
- [ ] T028 [US2] Add empty-state message (e.g., "No expenses this month") in `ExpenseList.vue` when expense list is empty in `frontend/src/components/expense/ExpenseList.vue`
- [ ] T029 [US2] Display `monthlyTotal` prominently in `ExpensePage.vue` (always visible, formatted as `$X.XX`) in `frontend/src/pages/ExpensePage.vue`

**Checkpoint**: Month navigation works with swipe and arrow taps; total updates on navigation; empty months show empty state

---

## Phase 5: User Story 3 — View Expense Details, Edit and Delete (Priority: P3)

**Goal**: Tapping an expense row opens a detail popup showing all fields; the user can edit any field or delete the record (with confirmation).

**Independent Test**: Tap an expense row — all fields appear in the popup (description hidden if empty). Tap Edit, change the amount, save — the row and total update. Tap Delete, confirm — the record disappears and the total updates. Cancel delete — record unchanged.

### Implementation for User Story 3

- [ ] T030 [P] [US3] Implement `updateExpense(id, changes)` action in `frontend/src/stores/expenses.ts` (re-derive `month` if `date` changed, update `updated` timestamp)
- [ ] T031 [P] [US3] Implement `deleteExpense(id)` action in `frontend/src/stores/expenses.ts`
- [ ] T032 [US3] Implement `ExpenseDetail.vue` — Vant popup showing all expense fields (description row hidden when empty); "Edit" and "Delete" action buttons in `frontend/src/components/expense/ExpenseDetail.vue`
- [ ] T033 [US3] Wire expense row tap in `ExpenseList.vue` to emit `select` event; handle in `ExpensePage.vue` to open `ExpenseDetail` with the selected expense in `frontend/src/components/expense/ExpenseList.vue`
- [ ] T034 [US3] Wire "Edit" button in `ExpenseDetail.vue` to open `ExpenseForm` in edit mode (pre-filled with current values; form calls `updateExpense` on save) in `frontend/src/components/expense/ExpenseDetail.vue`
- [ ] T035 [US3] Implement delete confirmation (`<van-dialog>` confirm prompt) in `ExpenseDetail.vue`; on confirm call `deleteExpense` and close popup; on cancel leave popup open in `frontend/src/components/expense/ExpenseDetail.vue`

**Checkpoint**: Full CRUD flow works — view detail, edit amount, delete with confirmation, cancel delete leaves record intact

---

## Phase 6: User Story 4 — View Pie Chart by Category (Priority: P4)

**Goal**: A "Chart" toggle on the Expense page shows a category-coloured pie chart for the displayed month; navigating months updates the chart; an empty month shows a placeholder.

**Independent Test**: With expenses in two or more different categories, switch to the Chart view — pie chart renders with correctly proportioned and coloured slices. Switch back to List — expense list is shown. Navigate to another month in Chart view — chart updates.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Add `categoryBreakdown` computed getter to `frontend/src/stores/expenses.ts` returning `Map<categoryId, sum>` for the current expenses list
- [ ] T037 [US4] Implement `CategoryPieChart.vue` — `vue-chartjs` `<Pie>` component; maps `categoryBreakdown` entries to labels, data, and `backgroundColor` colours from categories store; shows empty-state placeholder when breakdown is empty in `frontend/src/components/chart/CategoryPieChart.vue`
- [ ] T038 [US4] Add List / Chart segmented toggle (Vant `<van-tabs>` or custom toggle) to `ExpensePage.vue`; conditionally renders `ExpenseList` or `CategoryPieChart`; floating action buttons ("+" and "Split") remain visible in both views in `frontend/src/pages/ExpensePage.vue`

**Checkpoint**: Switching to Chart view renders pie chart with correct colours; switching back shows the list; month navigation updates the chart; empty month shows placeholder not an empty canvas

---

## Phase 7: User Story 5 — Split-Even Calculator (Priority: P5)

**Goal**: Tapping the "Split" FAB opens a popup with each member's paid total, their fair share, and a clear net-settlement instruction (or "All settled").

**Independent Test**: Record Hugo pays $200 and MM pays $100 (total $300). Tap Split — popup shows fair share $150.00 each, Hugo paid $200.00, MM paid $100.00, settlement "MM pays Hugo $50.00". Navigate to an empty month and re-open — all values show $0.00 and settlement shows "All settled — no payment needed".

### Implementation for User Story 5

- [ ] T039 [P] [US5] Implement pure `calculateSplit(memberPaidMap, memberIds, total)` function in `frontend/src/lib/split.ts` returning per-member `{ name, paid, fairShare, balance }` and `settlement` string; write Vitest unit tests covering: 2-member normal case, all-settled case, 1-member edge case, zero-expense case in `frontend/tests/unit/split.test.ts`
- [ ] T040 [P] [US5] Add `memberPaidTotals` computed getter to `frontend/src/stores/expenses.ts` returning `Map<memberId, sum>` for the current expenses list
- [ ] T041 [US5] Implement `SplitPopup.vue` — Vant `<van-popup>` listing each member's name, paid amount, and fair share; net-settlement line in bold; all amounts formatted as `$X.XX` in `frontend/src/components/split/SplitPopup.vue`
- [ ] T042 [US5] Add floating "Split" FAB (bottom-left overlay) to `ExpensePage.vue` that opens `SplitPopup` for the currently displayed month in `frontend/src/pages/ExpensePage.vue`

**Checkpoint**: Split popup shows correct figures; navigating months then re-opening shows figures for the new month; edge cases (0 expenses, 1 member) handled gracefully

---

## Phase 8: User Story 6 — Manage Categories (Priority: P6)

**Goal**: On the Setup page, the user can view, add, edit, and delete categories; a category with expense records cannot be deleted.

**Independent Test**: Open Setup → Categories, add a new category with name, colour, and icon. Open the expense form — the new category appears in the dropdown. Return to Setup, delete the new category — it disappears from the list and the dropdown. Attempt to delete a category that has associated expenses — an error message is shown and the category remains.

### Implementation for User Story 6

- [ ] T043 [P] [US6] Implement `addCategory()`, `updateCategory()`, `deleteCategory()` (with FK guard: check `expenses` reference count before delete and throw descriptive error) actions in `frontend/src/stores/categories.ts`
- [ ] T044 [US6] Implement `CategorySetup.vue` — lists all categories with name, colour swatch, and Lucide icon; "Add" button opens an add/edit form popup (Vant popup sheet) with: name text field, colour picker (predefined hex palette), Lucide icon picker (scrollable grid of allowed icon names); delete swipe-action with FK guard error toast in `frontend/src/components/setup/CategorySetup.vue`
- [ ] T045 [US6] Implement `SetupPage.vue` with Vant `<van-tabs>` sub-tabs "Family Members" and "Categories" rendering `MemberSetup` and `CategorySetup` in `frontend/src/pages/SetupPage.vue`

**Checkpoint**: Category CRUD works; newly added category appears in expense form dropdown; categories with expenses show error on delete attempt; colour and icon reflect in expense rows immediately after edit

---

## Phase 9: User Story 7 — Manage Family Members (Priority: P7)

**Goal**: On the Setup page, the user can view, add, rename, and remove members; a member referenced in any expense as Paid by cannot be removed.

**Independent Test**: Open Setup → Family Members, add a new member. Open the expense form — the new member appears in the Paid by dropdown. Return to Setup, delete the new member — they disappear. Attempt to delete a member referenced in an expense — an error message is shown and the member remains.

### Implementation for User Story 7

- [ ] T046 [P] [US7] Implement `addMember()`, `updateMember()`, `deleteMember()` (with FK guard: check `expenses` reference count before delete and throw descriptive error) actions in `frontend/src/stores/members.ts`
- [ ] T047 [US7] Implement `MemberSetup.vue` — lists all members by name; "Add" button opens a name input popup; inline rename on tap; delete swipe-action with FK guard error toast in `frontend/src/components/setup/MemberSetup.vue`
- [ ] T048 [US7] Wire `MemberSetup` into `SetupPage.vue` "Family Members" sub-tab in `frontend/src/pages/SetupPage.vue`

**Checkpoint**: Member CRUD works; new members appear in expense form "Paid by" dropdown; members with expense records show error on delete attempt; renamed members update all referencing expense display

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: PWA offline support, e2e tests, performance validation, accessibility, and quickstart verification.

- [ ] T049 [P] Add PWA manifest (`frontend/public/manifest.webmanifest`) and configure `vite-plugin-pwa` for offline-capable service worker in `frontend/vite.config.ts`; verify installable on mobile Chrome
- [ ] T050 [P] Write Playwright e2e test: add expense → verify in list → edit amount → verify updated → delete → verify removed + total updated in `frontend/tests/e2e/expense.spec.ts`
- [ ] T051 [P] Write Playwright e2e test: seed Hugo $200 + MM $100 → open split popup → assert settlement "MM pays Hugo $50.00" in `frontend/tests/e2e/split.spec.ts`
- [ ] T052 Audit WCAG 2.1 AA colour contrast on all 7 seed category colours + Vant component usage; fix any violations in `frontend/src/style.css` or component CSS
- [ ] T053 Run Lighthouse CI audit against production build; verify TTI ≤ 3 s and list + chart render < 1 s (SC-002); address any regressions in `frontend/`
- [ ] T054 Run full quickstart.md validation: `npm install` → `npm run dev` → `npm run build` → `npm run preview` → `npm run test:unit` → `npm run test:e2e`; fix any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Stories (Phases 3–9)**: All depend on Foundational completion; can proceed in priority order or in parallel if there is team capacity
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends on | Notes |
|-------|-----------|-------|
| US1 (P1) | Phase 2 complete | Foundational only; no story cross-deps |
| US2 (P2) | Phase 2 + US1 ExpensePage scaffold | Extends US1 page with navigation + total |
| US3 (P3) | Phase 2 + US1 (ExpenseList row tap) | Extends US1 list with detail/edit/delete |
| US4 (P4) | Phase 2 + US1 (ExpensePage toggle) | Adds chart view alongside existing list |
| US5 (P5) | Phase 2 + US1 (FAB in ExpensePage) | Pure calculator + popup; parallel to US2–4 |
| US6 (P6) | Phase 2 | SetupPage is independent of Expense page |
| US7 (P7) | Phase 2 + US6 (SetupPage sub-tabs wired) | Added to SetupPage alongside US6 |

### Within Each User Story

- Store actions before component UI
- Core component before page wiring
- Add/create before edit/delete extensions

---

## Parallel Opportunities

### Phase 1 — all [P] tasks run together after T001/T002:

```
T003 Tailwind CSS v4 setup
T004 TypeScript strict config
T005 ESLint config
T006 Vitest config
T007 Playwright config
```

### Phase 2 — store scaffolds are parallel after T012:

```
T013 expenses store scaffold
T014 categories store scaffold
T015 members store scaffold
```

### Phase 3 — category + member reads are parallel after T017 starts:

```
T018 loadCategories() action
T019 loadMembers() action
```

### Phase 7 — split calculator and store getter are parallel:

```
T039 split.ts + split.test.ts (pure logic, independent file)
T040 memberPaidTotals getter (store, independent file)
```

### Phase 10 — all validation tasks are parallel:

```
T049 PWA manifest + service worker
T050 expense.spec.ts e2e tests
T051 split.spec.ts e2e tests
T052 WCAG audit
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (T017–T024)
4. **STOP and VALIDATE**: Open app, record an expense, refresh browser — data persists
5. Ship or demo if ready

### Incremental Delivery

| Step | Delivery | Value |
|------|----------|-------|
| Phase 1 + 2 | Dev-ready scaffold | Tooling wired, DB opens, seed data present |
| + Phase 3 (US1) | **MVP** | Record expenses; data persists |
| + Phase 4 (US2) | Month navigation | Browse history by month |
| + Phase 5 (US3) | Edit & delete | Fix mistakes |
| + Phase 6 (US4) | Pie chart | Visual spending breakdown |
| + Phase 7 (US5) | Split calculator | Settlement results |
| + Phase 8 (US6) | Category setup | Customise categories |
| + Phase 9 (US7) | Member setup | Customise family members |
| + Phase 10 | Polish | PWA, e2e tests, perf audit |

---

## Summary

| Metric | Count |
|--------|-------|
| Total tasks | 54 |
| Phase 1 — Setup | 9 (T001–T009) |
| Phase 2 — Foundational | 7 (T010–T016) |
| Phase 3 — US1 Record Expense | 8 (T017–T024) |
| Phase 4 — US2 Month Navigation | 5 (T025–T029) |
| Phase 5 — US3 Detail/Edit/Delete | 6 (T030–T035) |
| Phase 6 — US4 Pie Chart | 3 (T036–T038) |
| Phase 7 — US5 Split Calculator | 4 (T039–T042) |
| Phase 8 — US6 Categories CRUD | 3 (T043–T045) |
| Phase 9 — US7 Members CRUD | 3 (T046–T048) |
| Phase 10 — Polish | 6 (T049–T054) |
| Parallelizable tasks [P] | 21 |

**Suggested MVP scope**: Phases 1–3 (T001–T024) deliver a fully functional expense recorder with IndexedDB persistence.
