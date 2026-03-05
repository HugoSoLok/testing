<script setup lang="ts">
import * as icons from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  color?: string
  size?: number
}>()

const IconComponent = computed(() => {
  const key = props.name as keyof typeof icons
  return (icons[key] as object) ?? icons.HelpCircle
})
</script>

<template>
  <component
    :is="IconComponent"
    :color="color ?? 'currentColor'"
    :size="size ?? 20"
    :stroke-width="1.75"
  />
</template>
