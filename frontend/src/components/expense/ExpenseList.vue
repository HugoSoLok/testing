<script setup lang="ts">
import { computed } from 'vue'
import ExpenseRow from './ExpenseRow.vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import { useMembersStore } from '@/stores/members'
import type { Expense } from '@/lib/db'

const emit = defineEmits<{
  select: [expense: Expense]
}>()

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()
const membersStore = useMembersStore()

const categoryMap = computed(() => {
  return new Map(categoriesStore.categories.map(c => [c.id!, c]))
})

const memberMap = computed(() => {
  return new Map(membersStore.members.map(m => [m.id!, m]))
})

function formatDateLabel(date: string): string {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (date === todayStr) return 'Today'
  if (date === yesterdayStr) return 'Yesterday'

  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(year, month - 1, day)
  )
}

const groupedExpenses = computed(() => {
  const sorted = [...expensesStore.expenses].sort((a, b) =>
    b.date.localeCompare(a.date)
  )
  const groups: { dateLabel: string; date: string; expenses: Expense[] }[] = []
  for (const expense of sorted) {
    const last = groups[groups.length - 1]
    if (last && last.date === expense.date) {
      last.expenses.push(expense)
    } else {
      groups.push({
        date: expense.date,
        dateLabel: formatDateLabel(expense.date),
        expenses: [expense],
      })
    }
  }
  return groups
})
</script>

<template>
  <div class="expense-list">
    <template v-if="expensesStore.expenses.length > 0">
      <div v-for="group in groupedExpenses" :key="group.date" class="date-group">
        <div class="date-header">{{ group.dateLabel }}</div>
        <ExpenseRow
          v-for="expense in group.expenses"
          :key="expense.id"
          :expense="expense"
          :category="categoryMap.get(expense.categoryId)"
          :member="memberMap.get(expense.paidBy)"
          @select="emit('select', $event)"
        />
      </div>
    </template>
    <div v-else class="empty-state">
      <van-empty description="No expenses this month" />
    </div>
  </div>
</template>

<style scoped>
.expense-list {
  flex: 1;
  overflow-y: auto;
}

.date-group {
  margin-bottom: 4px;
}

.date-header {
  padding: 8px 16px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #969799;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #f0f0f0;
}

.empty-state {
  padding: 48px 16px;
  text-align: center;
}
</style>
