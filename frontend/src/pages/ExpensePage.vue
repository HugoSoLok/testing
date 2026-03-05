<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MonthNav from '@/components/expense/MonthNav.vue'
import ExpenseList from '@/components/expense/ExpenseList.vue'
import ExpenseForm from '@/components/expense/ExpenseForm.vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import { useMembersStore } from '@/stores/members'
import type { Expense } from '@/lib/db'

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()
const membersStore = useMembersStore()

const showForm = ref(false)

// ─── Month navigation ─────────────────────────────────────────────────────────
function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function onPrevMonth() {
  const prev = shiftMonth(expensesStore.currentMonth, -1)
  await expensesStore.loadExpenses(prev)
}

async function onNextMonth() {
  const next = shiftMonth(expensesStore.currentMonth, +1)
  await expensesStore.loadExpenses(next)
}

// ─── Add expense ──────────────────────────────────────────────────────────────
async function onFormSubmit(data: Omit<Expense, 'id' | 'month' | 'created' | 'updated'>) {
  await expensesStore.addExpense(data)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    expensesStore.loadExpenses(expensesStore.currentMonth),
    categoriesStore.loadCategories(),
    membersStore.loadMembers(),
  ])
})
</script>

<template>
  <div class="expense-page">
    <MonthNav
      :month="expensesStore.currentMonth"
      @prev="onPrevMonth"
      @next="onNextMonth"
    />

    <div class="total-bar">
      <span class="total-label">Total</span>
      <span class="total-amount">${{ expensesStore.monthlyTotal.toFixed(2) }}</span>
    </div>

    <ExpenseList />

    <!-- Floating "+" FAB -->
    <button class="fab-add" aria-label="Add expense" @click="showForm = true">
      +
    </button>

    <ExpenseForm
      v-model:show="showForm"
      mode="add"
      @submit="onFormSubmit"
    />
  </div>
</template>

<style scoped>
.expense-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.total-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.total-label {
  font-size: 0.875rem;
  color: #969799;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #323233;
}

.fab-add {
  position: fixed;
  right: 20px;
  bottom: 72px; /* above tabbar */
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--van-primary-color, #3B82F6);
  color: #fff;
  font-size: 1.75rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 100;
}

.fab-add:active {
  transform: scale(0.93);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}
</style>
