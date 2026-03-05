<script setup lang="ts">
import { computed } from 'vue'
import LucideIcon from '@/components/common/LucideIcon.vue'
import type { Expense } from '@/lib/db'
import type { Category } from '@/lib/db'

const props = defineProps<{
  expense: Expense
  category: Category | undefined
}>()

const emit = defineEmits<{
  select: [expense: Expense]
}>()

const formattedAmount = computed(() =>
  `$${props.expense.amount.toFixed(2)}`
)
</script>

<template>
  <van-cell
    class="expense-row"
    clickable
    @click="emit('select', expense)"
  >
    <template #icon>
      <span class="category-icon" :style="{ color: category?.colour ?? '#6B7280' }">
        <LucideIcon :name="category?.icon ?? 'MoreHorizontal'" :size="22" />
      </span>
    </template>
    <template #title>
      <span class="amount">{{ formattedAmount }}</span>
    </template>
  </van-cell>
</template>

<style scoped>
.expense-row :deep(.van-cell__left-icon) {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

.amount {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
}
</style>
