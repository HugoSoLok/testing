# Local Storage Contract: Home Expense Tracker

**Phase**: 1 — Design  
**Branch**: `001-home-expense-tracker`  
**Date**: 2026-02-26 (updated 2026-03-04)  
**Storage**: Dexie.js `^4.0` (IndexedDB) — no backend, no HTTP API  
**Database name**: `home-expense-tracker`  
**Schema version**: `1`

---

## Overview

All data is stored locally in the browser's IndexedDB via Dexie.js. There are no HTTP endpoints. The `lib/db.ts` module exports a singleton `db` instance that is the only data access layer in the application.

---

## TypeScript Types

```typescript
export interface Member {
  id?: number;          // auto-increment PK
  name: string;         // required, unique (case-insensitive), max 50 chars
  created: string;      // ISO 8601, set on insert
  updated: string;      // ISO 8601, set on update
}

export interface Category {
  id?: number;          // auto-increment PK
  name: string;         // required, unique (case-insensitive), max 50 chars
  colour: string;       // required, format "#RRGGBB"
  icon: string;         // required, valid Lucide icon name
  created: string;
  updated: string;
}

export interface Expense {
  id?: number;          // auto-increment PK
  amount: number;       // required, > 0, stored as float (2 d.p.)
  categoryId: number;   // required, FK → categories.id
  paidBy: number;       // required, FK → members.id
  date: string;         // required, "YYYY-MM-DD"
  month: string;        // derived, "YYYY-MM" — stored for index queries
  description: string;  // optional, max 500 chars; "" if omitted
  created: string;
  updated: string;
}
```

---

## Dexie Schema

```typescript
// lib/db.ts
import Dexie, { type Table } from 'dexie';

class AppDB extends Dexie {
  expenses!:   Table<Expense>;
  categories!: Table<Category>;
  members!:    Table<Member>;

  constructor() {
    super('home-expense-tracker');
    this.version(1).stores({
      expenses:   '++id, month, [month+categoryId], [month+paidBy]',
      categories: '++id, &name',
      members:    '++id, &name',
    });
  }
}

export const db = new AppDB();
```

**Index notes**:
- `&name` on `categories` and `members` enforces unique name at the IndexedDB level.
- `[month+categoryId]` compound index powers pie chart aggregation.
- `[month+paidBy]` compound index powers split calculator aggregation.

---

## Operations Contract

### Expenses

#### Read — monthly list
```typescript
// Fetch all expenses for a given month, sorted most-recent date first
const expenses = await db.expenses
  .where('month').equals('2026-03')
  .sortBy('date');
// then reverse() for descending date order
```

**Contract rules**:
- Always filter by `month` index; never scan the full table.
- Sort by `date` descending; use `id` as tiebreaker (higher id = later insert).

#### Create
```typescript
const id = await db.expenses.add({
  amount: roundToTwoDP(amount),
  categoryId,
  paidBy,
  date,                        // "YYYY-MM-DD"
  month: date.slice(0, 7),     // derived
  description: description ?? '',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
});
```

**Contract rules**:
- `amount` MUST be rounded to 2 decimal places before storage.
- `month` MUST be derived as `date.slice(0, 7)`.
- `categoryId` MUST reference an existing `categories` record; validate before calling `add`.
- `paidBy` MUST reference an existing `members` record; validate before calling `add`.

#### Update
```typescript
await db.expenses.update(id, {
  ...changes,
  month: changes.date ? changes.date.slice(0, 7) : undefined,
  updated: new Date().toISOString(),
});
```

**Contract rules**:
- If `date` is changed, `month` MUST be re-derived and included in the update.

#### Delete
```typescript
await db.expenses.delete(id);
```

No cascade; referential integrity for `categoryId` and `paidBy` is enforced by blocking deletion of referenced categories/members (not by cascade delete).

---

### Categories

#### Read — all
```typescript
const categories = await db.categories.orderBy('name').toArray();
```

#### Create
```typescript
await db.categories.add({ name, colour, icon, created: now, updated: now });
```

**Contract rules**:
- `name` uniqueness enforced by Dexie `&name` index — throws `Dexie.ConstraintError` on duplicate.
- `colour` must match `/^#[0-9A-Fa-f]{6}$/` — validated client-side before insert.
- `icon` must be in the allowed Lucide icon list — validated client-side.

#### Update
```typescript
await db.categories.update(id, { ...changes, updated: now });
```

#### Delete — blocked if referenced
```typescript
const refCount = await db.expenses.where('categoryId').equals(id).count();
if (refCount > 0) throw new Error('Category has expense records and cannot be deleted.');
await db.categories.delete(id);
```

---

### Members

#### Read — all
```typescript
const members = await db.members.orderBy('name').toArray();
```

#### Create
```typescript
await db.members.add({ name, created: now, updated: now });
```

**Contract rules**:
- `name` uniqueness enforced by Dexie `&name` index.

#### Update
```typescript
await db.members.update(id, { name, updated: now });
```

#### Delete — blocked if referenced
```typescript
const refCount = await db.expenses.where('paidBy').equals(id).count();
if (refCount > 0) throw new Error('Member has expense records and cannot be removed.');
await db.members.delete(id);
```

---

## Aggregate Computations (client-side, not persisted)

| Computation | Query | Output |
|---|---|---|
| **Monthly total** | `db.expenses.where('month').equals(ym).toArray()` → `sum(amount)` | Single number |
| **Category breakdown** | Same array, `reduce` by `categoryId` | `Map<categoryId, sum>` |
| **Member paid totals** | Same array, `reduce` by `paidBy` | `Map<memberId, sum>` |
| **Fair share** | Monthly total ÷ `members.count()` | Per-member equal share |
| **Net balance** | Member paid − fair share | Positive = overpaid; negative = underpaid |
| **Settlement** | Net balances | `"MM pays Hugo $50.00"` or `"All settled"` |

---

## First-Launch Seed

On app startup, if `db.members.count() === 0`, seed default members. If `db.categories.count() === 0`, seed default categories.

```typescript
async function seedIfEmpty() {
  const now = new Date().toISOString();
  if (await db.members.count() === 0) {
    await db.members.bulkAdd([
      { name: 'Hugo', created: now, updated: now },
      { name: 'MM',   created: now, updated: now },
    ]);
  }
  if (await db.categories.count() === 0) {
    await db.categories.bulkAdd([
      { name: 'Food',          colour: '#F97316', icon: 'UtensilsCrossed', created: now, updated: now },
      { name: 'Transport',     colour: '#3B82F6', icon: 'Car',             created: now, updated: now },
      { name: 'Utilities',     colour: '#8B5CF6', icon: 'Zap',             created: now, updated: now },
      { name: 'Shopping',      colour: '#EC4899', icon: 'ShoppingBag',     created: now, updated: now },
      { name: 'Health',        colour: '#10B981', icon: 'Heart',           created: now, updated: now },
      { name: 'Entertainment', colour: '#F59E0B', icon: 'Tv',              created: now, updated: now },
      { name: 'Other',         colour: '#6B7280', icon: 'MoreHorizontal',  created: now, updated: now },
    ]);
  }
}
```

---

## Error Handling Contract

| Error type | Cause | UI response |
|---|---|---|
| `Dexie.ConstraintError` | Duplicate `name` on category or member | Show field-level "Name already exists" message |
| `ReferenceError` (custom) | Delete blocked by FK reference | Show "Has expense records and cannot be deleted/removed" message |
| `Dexie.DatabaseClosedError` | Browser storage quota exceeded (rare) | Show global error banner; suggest clearing old data |
| Any unexpected error | Bug / corruption | Log to console; show generic "Something went wrong" message |


