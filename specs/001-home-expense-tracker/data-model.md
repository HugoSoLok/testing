# Data Model: Home Expense Tracker

**Phase**: 1 — Design  
**Branch**: `001-home-expense-tracker`  
**Date**: 2026-02-26 (updated 2026-03-04)  
**Storage**: Dexie.js (IndexedDB) — browser-local, no backend

---

## Entities

### 1. `family_members`

Represents each person who shares household expenses. Referenced by expenses for `paidBy` and by the split calculator.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | number (auto-increment) | PK, immutable | Dexie `++id` |
| `name` | string | required, unique, max 50 chars | Display name (e.g., "Hugo", "MM") |
| `created` | string (ISO 8601) | set on insert | |
| `updated` | string (ISO 8601) | set on update | |

**Validation rules**:
- `name` must be non-empty and ≤ 50 characters.
- `name` must be unique (case-insensitive).

**Relationships**:
- Referenced by `expenses.paidBy` (many expenses → one member).

**Deletion rule**: Cannot delete a member if any `expenses` record references them as `paidBy`. Error: "Member has expense records and cannot be removed."

**Seed data** (inserted on first launch if table is empty):
```json
[
  { "name": "Hugo" },
  { "name": "MM" }
]
```

---

### 2. `categories`

Represents named groupings for expenses shown in the list row, pie chart, and form dropdown.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | number (auto-increment) | PK, immutable | Dexie `++id` |
| `name` | string | required, unique, max 50 chars | e.g., "Food", "Transport" |
| `colour` | string | required, format `#RRGGBB` | Hex colour code used in row icon and pie chart slice |
| `icon` | string | required, must be a valid Lucide icon name | e.g., `"ShoppingCart"`, `"Car"`, `"Zap"` |
| `created` | string (ISO 8601) | set on insert | |
| `updated` | string (ISO 8601) | set on update | |

**Validation rules**:
- `name` must be non-empty and ≤ 50 characters; unique case-insensitively.
- `colour` must match the regex `/^#[0-9A-Fa-f]{6}$/`.
- `icon` must be a string that corresponds to a valid Lucide icon identifier (validated client-side from the allowed icon list).

**Relationships**:
- Referenced by `expenses.categoryId` (many expenses → one category).

**Deletion rule**: Cannot delete a category if any `expenses` record references it. Error: "Category has expense records and cannot be deleted."

**Seed data** (inserted on first launch if table is empty):
```json
[
  { "name": "Food",          "colour": "#F97316", "icon": "UtensilsCrossed" },
  { "name": "Transport",     "colour": "#3B82F6", "icon": "Car" },
  { "name": "Utilities",     "colour": "#8B5CF6", "icon": "Zap" },
  { "name": "Shopping",      "colour": "#EC4899", "icon": "ShoppingBag" },
  { "name": "Health",        "colour": "#10B981", "icon": "Heart" },
  { "name": "Entertainment", "colour": "#F59E0B", "icon": "Tv" },
  { "name": "Other",         "colour": "#6B7280", "icon": "MoreHorizontal" }
]
```

---

### 3. `expenses`

The primary entity. Each record represents a single spending event.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | number (auto-increment) | PK, immutable | Dexie `++id` |
| `amount` | number (decimal) | required, > 0, stored as float (2 d.p.) | Stored as-is; display rounded to 2 d.p. |
| `categoryId` | number | required | FK to `categories.id`; deletion blocked if referenced |
| `paidBy` | number | required | FK to `family_members.id`; deletion blocked if referenced |
| `date` | string (ISO date) | required, defaults to today | Format `"YYYY-MM-DD"`; time component not stored |
| `month` | string | derived, indexed | Format `"YYYY-MM"`; stored for fast Dexie index queries |
| `description` | string | optional, max 500 chars | Free-text note; may be empty string |
| `created` | string (ISO 8601) | set on insert | |
| `updated` | string (ISO 8601) | set on update | |

**Validation rules**:
- `amount` must be a positive number > 0; rounded to 2 decimal places before storage; amounts with more than 2 d.p. are rounded and user is notified.
- `categoryId` must reference an existing category.
- `paidBy` must reference an existing family member.
- `date` must be a valid date; cannot be more than 5 years in the past or 1 day in the future.
- `description` max 500 characters; stored as empty string `""` if omitted (UI treats `""` as absent).
- `month` is derived as `date.slice(0, 7)` (e.g., `"2026-03"`) and stored alongside `date` to enable efficient Dexie index queries.

**Indexes** (Dexie compound indexes for month-range queries):
- `month` — primary query axis for monthly list.
- `[month+categoryId]` — used by pie chart aggregate query.
- `[month+paidBy]` — used by split calculator aggregate query.

---

## Relationships Diagram

```
family_members (1..*) ──── expenses.paidBy (many)
categories     (1..*) ──── expenses.categoryId (many)
```

---

## State Transitions

### Expense lifecycle
```
[new] → created  (db.expenses.add(record))
       → updated  (db.expenses.update(id, changes))
       → deleted  (db.expenses.delete(id))
```
No other lifecycle states. Soft-delete is not required.

---

## Aggregate Computations (client-side, not persisted)

These are computed in the Vue store from fetched records; they are not stored fields.

| Computation | Inputs | Output |
|---|---|---|
| **Monthly total** | All `expenses` in the displayed month | `sum(amount)` |
| **Category breakdown** | All `expenses` in the displayed month, grouped by `category_id` | `{ categoryId: sum(amount) }` map |
| **Member paid totals** | All `expenses` in the month, grouped by `paidBy` | `{ memberId: sum(amount) }` map |
| **Fair share** | Monthly total ÷ count of family members | Per-member equal share |
| **Net balance** | Member paid total − fair share | Positive = overpaid; negative = underpaid |
| **Settlement** | Net balances | "Member B pays Member A $X" or "All settled" |
