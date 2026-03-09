<script setup lang="ts">
import { ref, computed } from 'vue'
import { showConfirmDialog } from 'vant'
import LucideIcon from '@/components/common/LucideIcon.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useMembersStore } from '@/stores/members'
import { useExpensesStore } from '@/stores/expenses'
import type { Expense } from '@/lib/db'

const props = defineProps<{
  show: boolean
  expense: Expense | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  edit: [expense: Expense]
}>()

const categoriesStore = useCategoriesStore()
const membersStore = useMembersStore()
const expensesStore = useExpensesStore()

const category = computed(() =>
  categoriesStore.categories.find(c => c.id === props.expense?.categoryId)
)
const member = computed(() =>
  membersStore.members.find(m => m.id === props.expense?.paidBy)
)

const formattedAmount = computed(() =>
  props.expense ? `$${props.expense.amount.toFixed(2)}` : ''
)

const formattedDate = computed(() => {
  if (!props.expense) return ''
  const [y, m, d] = props.expense.date.split('-')
  return `${d}/${m}/${y}`
})

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleting = ref(false)

async function handleDelete() {
  if (!props.expense) return
  try {
    await showConfirmDialog({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ee0a24',
      cancelButtonText: 'Cancel',
    })
    deleting.value = true
    await expensesStore.deleteExpense(props.expense.id!)
    emit('update:show', false)
  } catch {
    // user cancelled — do nothing
  } finally {
    deleting.value = false
  }
}

// ─── Edit ─────────────────────────────────────────────────────────────────────
function handleEdit() {
  if (props.expense) emit('edit', props.expense)
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
    <div v-if="expense" class="detail-sheet">
      <!-- Header -->
      <div class="detail-header">
        <span
          class="detail-icon"
          :style="{ color: category?.colour ?? '#6B7280' }"
        >
          <LucideIcon :name="category?.icon ?? 'MoreHorizontal'" :size="28" />
        </span>
        <span class="detail-amount">{{ formattedAmount }}</span>
        <van-icon
          name="cross"
          class="detail-close"
          @click="$emit('update:show', false)"
        />
      </div>

      <!-- Fields -->
      <van-cell-group inset class="detail-fields">
        <van-cell title="Category" :value="category?.name ?? '—'" />
        <van-cell title="Paid by" :value="member?.name ?? '—'" />
        <van-cell title="Date" :value="formattedDate" />
        <van-cell
          v-if="expense.description"
          title="Description"
          :value="expense.description"
          :value-class="'detail-desc'"
        />
      </van-cell-group>

      <!-- Actions -->
      <div class="detail-actions">
        <van-button
          plain
          type="danger"
          round
          :loading="deleting"
          @click="handleDelete"
        >
          Delete
        </van-button>
        <van-button
          type="primary"
          round
          @click="handleEdit"
        >
          Edit
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.detail-sheet {
  padding: 20px 16px 32px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  flex-shrink: 0;
}

.detail-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #323233;
  flex: 1;
}

.detail-close {
  font-size: 1.25rem;
  color: #969799;
  cursor: pointer;
  padding: 4px;
}

.detail-fields {
  margin-bottom: 24px;
}

.detail-desc :deep(.van-cell__value) {
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.detail-actions .van-button {
  flex: 1;
}
</style>
