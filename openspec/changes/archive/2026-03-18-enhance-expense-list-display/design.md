## Context

The expense list (`ExpenseList.vue` + `ExpenseRow.vue`) currently renders a flat list of expenses showing only a category icon and formatted amount. The `Expense` model already carries `description`, `paidBy` (FK to members), and `date` fields that are unused in the list view. The detail sheet (`ExpenseDetail.vue`) already resolves payer name and formats dates — consistent patterns already exist to follow.

## Goals / Non-Goals

**Goals:**
- Show description (or category name fallback) as the row's primary label
- Show payer name as the row's secondary line
- Right-align the amount
- Group expenses by date with smart headers (`Today`, `Yesterday`, `Mar 5`)

**Non-Goals:**
- Changing the expense data model
- Adding sorting controls or filters
- Altering the detail sheet or edit form
- Paginating or virtualizing the list

## Decisions

### 1. Use `van-cell` slots for two-line row layout

`van-cell` provides `#title`, `#label`, and `#value` slots. Map:
- `#title` → description (fallback: category name)
- `#label` → payer name
- `#value` → formatted amount (right-aligned by default)

**Alternative considered**: Custom row markup. Rejected — `van-cell` already handles alignment, tap states, and accessibility; no need for custom layout.

### 2. Resolve member in `ExpenseList`, pass as prop to `ExpenseRow`

`ExpenseList` already builds a `categoryMap` from the categories store. Add a `memberMap` with the same pattern, then pass the resolved `Member` object down as a new `:member` prop on `ExpenseRow`.

**Alternative considered**: Reading the store directly inside `ExpenseRow`. Rejected — keeps the row as a pure presentational component; easier to test and reuse.

### 3. Compute grouped expenses in `ExpenseList`

Add a `groupedExpenses` computed property that returns an array of `{ dateLabel: string, expenses: Expense[] }` objects, sorted descending by date. The `v-for` in the template iterates groups, renders a date header per group, then an `ExpenseRow` per expense.

Date label logic (all comparisons in local `YYYY-MM-DD` string):
- today's date → `"Today"`
- yesterday's date → `"Yesterday"`
- anything else → `"Mar 5"` format (`Intl.DateTimeFormat` with `{ month: 'short', day: 'numeric' }`)

**Alternative considered**: Sorting and emitting date headers inline with a flag on each row. Rejected — harder to reason about and doesn't separate concerns cleanly.

## Risks / Trade-offs

- **Long description truncation** → Mitigate with `text-overflow: ellipsis` on the title span; single line only.
- **No member found** (`paidBy` FK broken) → Render empty string for payer name; graceful degradation, no crash.
- **Performance on large lists** → Group computation is O(n) and memoized by Vue's reactivity; acceptable for a single-month view.
