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

  async function updateExpense(_id: number, _changes: Partial<Omit<Expense, 'id' | 'created'>>): Promise<void> {
    // Stub — implemented in Phase 5 (T030)
  }

  async function deleteExpense(_id: number): Promise<void> {
    // Stub — implemented in Phase 5 (T031)
  }

  function goToPreviousMonth(): void {
    // Stub — implemented in Phase 4 (T026)
  }

  function goToNextMonth(): void {
    // Stub — implemented in Phase 4 (T026)
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
