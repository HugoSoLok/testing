import Dexie, { type Table } from 'dexie'

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface Member {
  id?: number         // auto-increment PK
  name: string        // required, unique (case-insensitive), max 50 chars
  created: string     // ISO 8601, set on insert
  updated: string     // ISO 8601, set on update
}

export interface Category {
  id?: number         // auto-increment PK
  name: string        // required, unique (case-insensitive), max 50 chars
  colour: string      // required, format "#RRGGBB"
  icon: string        // required, valid Lucide icon name
  created: string
  updated: string
}

export interface Expense {
  id?: number         // auto-increment PK
  amount: number      // required, > 0, stored as float (2 d.p.)
  categoryId: number  // required, FK → categories.id
  paidBy: number      // required, FK → members.id
  date: string        // required, "YYYY-MM-DD"
  month: string       // derived, "YYYY-MM" — stored for index queries
  description: string // optional, max 500 chars; "" if omitted
  created: string
  updated: string
}

// ─── Dexie Database Class ─────────────────────────────────────────────────────

class AppDB extends Dexie {
  expenses!: Table<Expense>
  categories!: Table<Category>
  members!: Table<Member>

  constructor() {
    super('home-expense-tracker')
    this.version(1).stores({
      expenses:   '++id, month, [month+categoryId], [month+paidBy]',
      categories: '++id, &name',
      members:    '++id, &name',
    })
  }
}

export const db = new AppDB()

// ─── First-Launch Seed ────────────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<void> {
  const now = new Date().toISOString()

  if ((await db.members.count()) === 0) {
    await db.members.bulkAdd([
      { name: 'Hugo', created: now, updated: now },
      { name: 'MM',   created: now, updated: now },
    ])
  }

  if ((await db.categories.count()) === 0) {
    await db.categories.bulkAdd([
      { name: 'Food',          colour: '#EA580C', icon: 'UtensilsCrossed', created: now, updated: now }, // orange-600 3.32:1
      { name: 'Transport',     colour: '#3B82F6', icon: 'Car',             created: now, updated: now }, // blue-500   3.75:1
      { name: 'Utilities',     colour: '#8B5CF6', icon: 'Zap',             created: now, updated: now }, // violet-500 5.77:1
      { name: 'Shopping',      colour: '#EC4899', icon: 'ShoppingBag',     created: now, updated: now }, // pink-500   5.20:1
      { name: 'Health',        colour: '#059669', icon: 'Heart',           created: now, updated: now }, // emerald-600 3.49:1
      { name: 'Entertainment', colour: '#B45309', icon: 'Tv',              created: now, updated: now }, // amber-700  4.55:1
      { name: 'Other',         colour: '#6B7280', icon: 'MoreHorizontal',  created: now, updated: now }, // gray-500   4.79:1
    ])
  }
}
