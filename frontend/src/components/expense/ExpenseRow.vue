<script setup lang="ts">
import { computed } from 'vue'
import LucideIcon from '@/components/common/LucideIcon.vue'
import type { Expense, Category, Member } from '@/lib/db'

const props = defineProps<{
  expense: Expense
  category: Category | undefined
  member: Member | undefined
}>()

const emit = defineEmits<{
  select: [expense: Expense]
}>()

const displayLabel = computed(() =>
  props.expense.description || props.category?.name || ''
)

const formattedAmount = computed(() =>
  `$${props.expense.amount.toFixed(2)}`
)
</script>

<template>
  <div class="expense-row">
    <van-cell
      clickable
      @click="emit('select', expense)"
    >
      <template #icon>
        <span class="category-icon" :style="{ color: category?.colour ?? '#6B7280' }">
          <LucideIcon :name="category?.icon ?? 'MoreHorizontal'" :size="22" />
        </span>
      </template>
      <template #title>
        <span class="label">{{ displayLabel }}</span>
      </template>
      <template #label>
        <span class="payer">{{ member?.name ?? '' }}</span>
      </template>
      <template #value>
        <span class="amount">{{ formattedAmount }}</span>
      </template>
    </van-cell>
  </div>
</template>

<style scoped>
.expense-row :deep(.van-cell) {
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
}

.expense-row :deep(.van-cell__left-icon) {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.expense-row :deep(.van-cell__label) {
  margin-top: 0;
  line-height: 1.2;
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

.label {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.2;
  color: #323233;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payer {
  font-size: 0.8125rem;
  line-height: 1.2;
  color: #969799;
}

.amount {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
}
</style>
