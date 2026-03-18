<script setup lang="ts">
import { ref, watch } from 'vue'
import CategorySetup from '@/components/setup/CategorySetup.vue'
import MemberSetup from '@/components/setup/MemberSetup.vue'

const activeTab = ref('members')
const categorySetupRef = ref<InstanceType<typeof CategorySetup> | null>(null)

// Close any open popup when the user switches tabs
watch(activeTab, () => {
  categorySetupRef.value?.closePopup()
})
</script>

<template>
  <div class="setup-page">
    <van-tabs
      v-model:active="activeTab"
      sticky
      animated
    >
      <van-tab
        title="Family Members"
        name="members"
      >
        <MemberSetup />
      </van-tab>
      <van-tab
        title="Categories"
        name="categories"
      >
        <CategorySetup ref="categorySetupRef" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped>
.setup-page {
  min-height: 100%;
  background: #f7f8fa;
}
</style>
