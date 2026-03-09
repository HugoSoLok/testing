<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useMembersStore } from '@/stores/members'
import type { Expense } from '@/lib/db'

const props = defineProps<{
  show: boolean
  mode?: 'add' | 'edit'
  expense?: Expense
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  submit: [data: Omit<Expense, 'id' | 'month' | 'created' | 'updated'>]
}>()

const categoriesStore = useCategoriesStore()
const membersStore = useMembersStore()

// ─── Form state ───────────────────────────────────────────────────────────────
const amount = ref('')
const selectedCategoryId = ref<number | null>(null)
const selectedPaidById = ref<number | null>(null)
const date = ref('')
const description = ref('')

// ─── Sub-popup visibility ─────────────────────────────────────────────────────
const showCategoryPicker = ref(false)
const showMemberPicker = ref(false)
const showDatePicker = ref(false)

// reactive picker v-models
const datePickerValue = ref<string[]>([])

// ─── Derived column data ──────────────────────────────────────────────────────
const categoryColumns = computed(() =>
  categoriesStore.categories.map(c => ({ text: c.name, value: String(c.id) }))
)
const memberColumns = computed(() =>
  membersStore.members.map(m => ({ text: m.name, value: String(m.id) }))
)

const selectedCategoryLabel = computed(() =>
  categoriesStore.categories.find(c => c.id === selectedCategoryId.value)?.name ?? ''
)
const selectedMemberLabel = computed(() =>
  membersStore.members.find(m => m.id === selectedPaidById.value)?.name ?? ''
)

// ─── Errors ───────────────────────────────────────────────────────────────────
const errors = ref({ amount: '', category: '', paidBy: '' })

// ─── Lifecycle ────────────────────────────────────────────────────────────────
watch(
  () => props.show,
  (val) => {
    if (!val) return
    errors.value = { amount: '', category: '', paidBy: '' }
    if (props.mode === 'edit' && props.expense) {
      amount.value = String(props.expense.amount)
      selectedCategoryId.value = props.expense.categoryId
      selectedPaidById.value = props.expense.paidBy
      date.value = props.expense.date
      description.value = props.expense.description
    } else {
      amount.value = ''
      selectedCategoryId.value = categoriesStore.categories[0]?.id ?? null
      selectedPaidById.value = membersStore.members[0]?.id ?? null
      date.value = new Date().toISOString().slice(0, 10)
      description.value = ''
    }
    datePickerValue.value = date.value.split('-')
  }
)

// ─── Picker handlers ──────────────────────────────────────────────────────────
function onCategoryConfirm({ selectedValues }: { selectedValues: string[] }) {
  selectedCategoryId.value = Number(selectedValues[0])
  showCategoryPicker.value = false
}

function onMemberConfirm({ selectedValues }: { selectedValues: string[] }) {
  selectedPaidById.value = Number(selectedValues[0])
  showMemberPicker.value = false
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  const [y, m, d] = selectedValues
  date.value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  showDatePicker.value = false
}

// ─── Validation & submit ──────────────────────────────────────────────────────
function validate(): boolean {
  errors.value = { amount: '', category: '', paidBy: '' }
  let ok = true
  const amt = parseFloat(amount.value)
  if (!amount.value || isNaN(amt) || amt <= 0) {
    errors.value.amount = 'Enter an amount greater than 0'
    ok = false
  }
  if (!selectedCategoryId.value) {
    errors.value.category = 'Select a category'
    ok = false
  }
  if (!selectedPaidById.value) {
    errors.value.paidBy = 'Select who paid'
    ok = false
  }
  return ok
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    amount: parseFloat(amount.value),
    categoryId: selectedCategoryId.value!,
    paidBy: selectedPaidById.value!,
    date: date.value,
    description: description.value.trim(),
  })
  emit('update:show', false)
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ maxHeight: '90dvh' }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="form-header">
      <span class="form-title">{{ mode === 'edit' ? 'Edit Expense' : 'New Expense' }}</span>
      <van-icon name="cross" class="close-btn" @click="$emit('update:show', false)" />
    </div>

    <div class="form-body">
      <!-- Amount -->
      <van-field
        v-model="amount"
        label="Amount"
        type="number"
        placeholder="0.00"
        input-align="right"
        :error-message="errors.amount"
        required
        clearable
      />

      <!-- Category -->
      <van-field
        :model-value="selectedCategoryLabel"
        label="Category"
        placeholder="Select category"
        readonly
        is-link
        :error-message="errors.category"
        required
        @click="showCategoryPicker = true"
      />

      <!-- Paid by -->
      <van-field
        :model-value="selectedMemberLabel"
        label="Paid by"
        placeholder="Select member"
        readonly
        is-link
        :error-message="errors.paidBy"
        required
        @click="showMemberPicker = true"
      />

      <!-- Date -->
      <van-field
        :model-value="date"
        label="Date"
        placeholder="Select date"
        readonly
        is-link
        required
        @click="showDatePicker = true"
      />

      <!-- Description -->
      <van-field
        v-model="description"
        label="Description"
        type="textarea"
        placeholder="Optional note"
        rows="2"
        autosize
        maxlength="500"
        show-word-limit
      />

      <div class="form-actions">
        <van-button
          type="primary"
          block
          round
          @click="handleSubmit"
        >
          {{ mode === 'edit' ? 'Save Changes' : 'Add Expense' }}
        </van-button>
      </div>
    </div>

    <!-- Category picker -->
    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker
        :columns="categoryColumns"
        :default-index="0"
        show-toolbar
        title="Category"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>

    <!-- Paid by picker -->
    <van-popup v-model:show="showMemberPicker" position="bottom" round>
      <van-picker
        :columns="memberColumns"
        :default-index="0"
        show-toolbar
        title="Paid by"
        @confirm="onMemberConfirm"
        @cancel="showMemberPicker = false"
      />
    </van-popup>

    <!-- Date picker -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="datePickerValue"
        title="Select Date"
        :min-date="new Date(2020, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<style scoped>
.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 0;
}

.form-title {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
}

.close-btn {
  font-size: 1.25rem;
  color: #969799;
  cursor: pointer;
  padding: 4px;
}

.form-body {
  padding-bottom: 24px;
  overflow-y: auto;
}

.form-actions {
  padding: 16px 16px 0;
}
</style>
