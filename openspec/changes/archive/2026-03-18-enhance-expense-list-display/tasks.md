## 1. Update ExpenseRow Component

- [x] 1.1 Add `member` prop (type `Member | undefined`) to `ExpenseRow.vue`
- [x] 1.2 Compute `displayLabel` — description if non-empty, else category name
- [x] 1.3 Replace `#title` slot content with `displayLabel`
- [x] 1.4 Add `#label` slot rendering payer name (`member?.name ?? ''`)
- [x] 1.5 Move amount to `#value` slot (right-aligned) and remove old `#title` amount markup
- [x] 1.6 Update styles: add ellipsis truncation for long descriptions; style secondary payer line

## 2. Update ExpenseList Component

- [x] 2.1 Import `useMembersStore` and build `memberMap` computed (same pattern as `categoryMap`)
- [x] 2.2 Add `groupedExpenses` computed: sort expenses descending by date, group into `{ dateLabel, expenses }[]`
- [x] 2.3 Implement `formatDateLabel(date: string): string` — returns `Today`, `Yesterday`, or short date (e.g. `Mar 5`)
- [x] 2.4 Update template: replace flat `v-for` with grouped render (date header + `ExpenseRow` per group)
- [x] 2.5 Pass `:member="memberMap.get(expense.paidBy)"` to each `ExpenseRow`
- [x] 2.6 Style date header elements (font weight, spacing, separator line)

## 3. Verification

- [x] 3.1 Smoke-test: expenses with description show description; expenses without show category name
- [x] 3.2 Smoke-test: payer name appears on second line
- [x] 3.3 Smoke-test: today/yesterday/older date headers render correctly
- [x] 3.4 Smoke-test: expenses on same date appear under one header
- [x] 3.5 Run existing unit and e2e test suites; confirm no regressions
