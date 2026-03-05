<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  month: string // "YYYY-MM"
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const label = computed(() => {
  const [year, mon] = props.month.split('-')
  return `${MONTH_NAMES[parseInt(mon, 10) - 1]} ${year}`
})
</script>

<template>
  <div class="month-nav">
    <button class="nav-btn" aria-label="Previous month" @click="emit('prev')">
      ‹
    </button>
    <span class="month-label">{{ label }}</span>
    <button class="nav-btn" aria-label="Next month" @click="emit('next')">
      ›
    </button>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.month-label {
  font-size: 1rem;
  font-weight: 600;
  color: #323233;
  user-select: none;
}

.nav-btn {
  all: unset;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  color: #646566;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background 0.15s;
}

.nav-btn:hover {
  background: #f5f5f5;
}

.nav-btn:active {
  background: #ebebeb;
}
</style>
