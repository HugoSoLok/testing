import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, type Expense } from '@/lib/db'

export const useExpensesStore = defineStore('expenses', () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const currentMonth = ref<string>(new Date().toISOString().slice(0, 7)) // "YYYY-MM"
  const expenses = ref<Expense[]>([])

  // ─── Getters ─────────────────────────────────────────────────────────────────
  const monthlyTotal = computed(() =>
    expenses.value.reduce((sum, e) => sum + e.amount, 0)
  )

  const categoryBreakdown = computed(() => {
    const map = new Map<number, number>()
    for (const e of expenses.value) {
      map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
    }
    return map
  })

  const memberPaidTotals = computed(() => {
    const map = new Map<number, number>()
    for (const e of expenses.value) {
      map.set(e.paidBy, (map.get(e.paidBy) ?? 0) + e.amount)
    }
    return map
  })

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function loadExpenses(month: string): Promise<void> {
    currentMonth.value = month
    const results = await db.expenses.where('month').equals(month).sortBy('date')
    expenses.value = results.reverse()
  }

  async function addExpense(data: Omit<Expense, 'id' | 'month' | 'created' | 'updated'>): Promise<void> {
    const now = new Date().toISOString()
    await db.expenses.add({
      ...data,
      amount: roundToTwoDP(data.amount),
      month: data.date.slice(0, 7),
      created: now,
      updated: now,
    })
    await loadExpenses(currentMonth.value)
  }

  async function updateExpense(id: number, changes: Partial<Omit<Expense, 'id' | 'created'>>): Promise<void> {
    const update: Partial<Expense> = {
      ...changes,
      updated: new Date().toISOString(),
    }
    if (changes.date) {
      update.month = changes.date.slice(0, 7)
    }
    await db.expenses.update(id, update)
    await loadExpenses(currentMonth.value)
  }

  async function deleteExpense(id: number): Promise<void> {
    await db.expenses.delete(id)
    await loadExpenses(currentMonth.value)
  }

  function shiftMonth(ym: string, delta: number): string {
    const [y, m] = ym.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  async function goToPreviousMonth(): Promise<void> {
    await loadExpenses(shiftMonth(currentMonth.value, -1))
  }

  async function goToNextMonth(): Promise<void> {
    await loadExpenses(shiftMonth(currentMonth.value, +1))
  }

  return {
    currentMonth,
    expenses,
    monthlyTotal,
    categoryBreakdown,
    memberPaidTotals,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    goToPreviousMonth,
    goToNextMonth,
  }
})

// Helper used by store actions
export function roundToTwoDP(value: number): number {
  return Math.round(value * 100) / 100
}

// Re-export db for convenience
export { db }
