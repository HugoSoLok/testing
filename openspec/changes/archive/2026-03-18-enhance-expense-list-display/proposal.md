## Why

The expense list currently shows only a category icon and amount, making it hard to identify individual expenses at a glance. Users need to see the description, who paid, and when — without opening each expense.

## What Changes

- `ExpenseRow` displays description as the primary label (falls back to category name when blank), payer name as a secondary line, and amount right-aligned
- `ExpenseList` groups expenses by date with smart date headers (`Today`, `Yesterday`, or `Mar 5` format)
- `ExpenseList` passes a resolved `member` object down to `ExpenseRow` alongside the existing `category`

## Capabilities

### New Capabilities
- `expense-list-display`: Visual presentation of expense rows including description, payer, grouped-by-date layout, and smart date headers

### Modified Capabilities

## Impact

- `frontend/src/components/expense/ExpenseRow.vue` — new props and template slots
- `frontend/src/components/expense/ExpenseList.vue` — member map, date grouping computed, date header rendering
