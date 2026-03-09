<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useSwipe } from '@vueuse/core'
import MonthNav from '@/components/expense/MonthNav.vue'
import ExpenseList from '@/components/expense/ExpenseList.vue'
import ExpenseForm from '@/components/expense/ExpenseForm.vue'
import ExpenseDetail from '@/components/expense/ExpenseDetail.vue'
import SplitPopup from '@/components/split/SplitPopup.vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import { useMembersStore } from '@/stores/members'
import type { Expense } from '@/lib/db'

// Lazy-load Chart.js bundle — only fetched when the user taps "Chart"
const CategoryPieChart = defineAsyncComponent(
  () => import('@/components/chart/CategoryPieChart.vue'),
)

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()
const membersStore = useMembersStore()
// ─── View toggle ─────────────────────────────────────────────────────────────
const activeView = ref<'list' | 'chart'>('list')
const showSplit = ref(false)
// ─── Add form ──────────────────────────────────────────────────────────────
const showForm = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingExpense = ref<Expense | undefined>(undefined)

// ─── Detail popup ─────────────────────────────────────────────────────────────
const showDetail = ref(false)
const selectedExpense = ref<Expense | null>(null)

function onSelectExpense(expense: Expense) {
  selectedExpense.value = expense
  showDetail.value = true
}

// ─── Edit flow (T034) ───────────────────────────────────────────────────────────
function onEditExpense(expense: Expense) {
  editingExpense.value = expense
  formMode.value = 'edit'
  showDetail.value = false
  showForm.value = true
}

function onAddExpense() {
  editingExpense.value = undefined
  formMode.value = 'add'
  showForm.value = true
}

async function onFormSubmit(data: Omit<Expense, 'id' | 'month' | 'created' | 'updated'>) {
  if (formMode.value === 'edit' && editingExpense.value?.id != null) {
    await expensesStore.updateExpense(editingExpense.value.id, data)
  } else {
    await expensesStore.addExpense(data)
  }
}

// ─── Swipe gesture (T027) ─────────────────────────────────────────────────────
const listAreaRef = ref<HTMLElement | null>(null)
useSwipe(listAreaRef, {
  onSwipeEnd(_e, direction) {
    if (direction === 'left') expensesStore.goToNextMonth()
    else if (direction === 'right') expensesStore.goToPreviousMonth()
  },
})

// ─── Month navigation ─────────────────────────────────────────────────────────
async function onPrevMonth() {
  await expensesStore.goToPreviousMonth()
}
async function onNextMonth() {
  await expensesStore.goToNextMonth()
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

    <!-- List / Chart toggle -->
    <div class="view-toggle">
      <button
        :class="['toggle-btn', { active: activeView === 'list' }]"
        @click="activeView = 'list'"
      >List</button>
      <button
        :class="['toggle-btn', { active: activeView === 'chart' }]"
        @click="activeView = 'chart'"
      >Chart</button>
    </div>

    <div ref="listAreaRef" class="list-area">
      <ExpenseList v-if="activeView === 'list'" @select="onSelectExpense" />
      <CategoryPieChart v-else />
    </div>

    <!-- Floating "+" FAB -->
    <button class="fab-add" aria-label="Add expense" @click="onAddExpense">
      +
    </button>

    <!-- Floating Split FAB -->
    <button class="fab-split" aria-label="Split calculator" @click="showSplit = true">
      ÷
    </button>

    <SplitPopup v-model:show="showSplit" />

    <ExpenseDetail
      v-model:show="showDetail"
      :expense="selectedExpense"
      @edit="onEditExpense"
    />

    <ExpenseForm
      v-model:show="showForm"
      :mode="formMode"
      :expense="editingExpense"
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

.list-area {
  flex: 1;
  overflow-y: auto;
  touch-action: pan-y; /* allow vertical scroll; swipe captured by useSwipe */
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

.fab-split {
  position: fixed;
  left: 20px;
  bottom: 72px; /* above tabbar */
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  color: #3B82F6;
  font-size: 1.5rem;
  line-height: 1;
  border: 2px solid #3B82F6;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
  z-index: 100;
}

.fab-split:active {
  transform: scale(0.93);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.view-toggle {
  display: flex;
  background: #f5f5f5;
  padding: 4px;
  gap: 2px;
  border-bottom: 1px solid #f0f0f0;
}

.toggle-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #969799;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.toggle-btn.active {
  background: #fff;
  color: #3B82F6;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
