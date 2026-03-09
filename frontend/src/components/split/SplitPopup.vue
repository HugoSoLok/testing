<script setup lang="ts">
import { computed } from 'vue'
import { calculateSplit } from '@/lib/split'
import { useExpensesStore } from '@/stores/expenses'
import { useMembersStore } from '@/stores/members'

defineProps<{ show: boolean }>()
defineEmits<{ 'update:show': [value: boolean] }>()

const expensesStore = useExpensesStore()
const membersStore = useMembersStore()

const splitResult = computed(() =>
  calculateSplit(
    expensesStore.memberPaidTotals,
    membersStore.members.map(m => ({ id: m.id!, name: m.name })),
    expensesStore.monthlyTotal,
  )
)

function fmt(n: number): string {
  return `$${n.toFixed(2)}`
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ maxHeight: '80dvh' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="split-sheet">
      <div class="split-header">
        <span class="split-title">Split Calculator</span>
        <van-icon name="cross" class="split-close" @click="$emit('update:show', false)" />
      </div>

      <!-- Per-member rows -->
      <van-cell-group inset class="split-members">
        <van-cell
          v-for="m in splitResult.members"
          :key="m.id"
          :title="m.name"
        >
          <template #label>
            <span class="split-label">Fair share: {{ fmt(m.fairShare) }}</span>
          </template>
          <template #value>
            <span class="split-paid">{{ fmt(m.paid) }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- Settlement line -->
      <div class="settlement-row">
        <span class="settlement-text">{{ splitResult.settlement }}</span>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.split-sheet {
  padding: 20px 16px 36px;
}

.split-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.split-title {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
}

.split-close {
  font-size: 1.25rem;
  color: #969799;
  cursor: pointer;
  padding: 4px;
}

.split-members {
  margin-bottom: 20px;
}

.split-label {
  font-size: 0.8rem;
  color: #969799;
}

.split-paid {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
}

.settlement-row {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
}

.settlement-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #323233;
}
</style>
