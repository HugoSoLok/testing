<script setup lang="ts">
import { computed } from 'vue'
import ExpenseRow from './ExpenseRow.vue'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'
import type { Expense } from '@/lib/db'

const emit = defineEmits<{
  select: [expense: Expense]
}>()

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const categoryMap = computed(() => {
  const map = new Map(categoriesStore.categories.map(c => [c.id!, c]))
  return map
})
</script>

<template>
  <div class="expense-list">
    <template v-if="expensesStore.expenses.length > 0">
      <ExpenseRow
        v-for="expense in expensesStore.expenses"
        :key="expense.id"
        :expense="expense"
        :category="categoryMap.get(expense.categoryId)"
        @select="emit('select', $event)"
      />
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

.empty-state {
  padding: 48px 16px;
  text-align: center;
}
</style>
