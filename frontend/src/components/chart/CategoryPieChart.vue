<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { useExpensesStore } from '@/stores/expenses'
import { useCategoriesStore } from '@/stores/categories'

ChartJS.register(ArcElement, Tooltip, Legend)

const expensesStore = useExpensesStore()
const categoriesStore = useCategoriesStore()

const isEmpty = computed(() => expensesStore.categoryBreakdown.size === 0)

const chartData = computed<ChartData<'pie'>>(() => {
  const categoryMap = new Map(categoriesStore.categories.map(c => [c.id!, c]))
  const labels: string[] = []
  const data: number[] = []
  const backgroundColors: string[] = []

  for (const [categoryId, sum] of expensesStore.categoryBreakdown) {
    const cat = categoryMap.get(categoryId)
    labels.push(cat?.name ?? 'Unknown')
    data.push(sum)
    backgroundColors.push(cat?.colour ?? '#6B7280')
  }

  return {
    labels,
    datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 2, borderColor: '#fff' }],
  }
})

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, font: { size: 13 } },
    },
    tooltip: {
      callbacks: {
        label(ctx) {
          const value = ctx.parsed as number
          return ` $${value.toFixed(2)}`
        },
      },
    },
  },
}
</script>

<template>
  <div class="pie-chart-wrapper">
    <template v-if="!isEmpty">
      <Pie :data="chartData" :options="chartOptions" />
    </template>
    <div v-else class="chart-empty">
      <van-empty description="No expenses this month" />
    </div>
  </div>
</template>

<style scoped>
.pie-chart-wrapper {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-empty {
  padding: 48px 0;
  width: 100%;
  text-align: center;
}
</style>
