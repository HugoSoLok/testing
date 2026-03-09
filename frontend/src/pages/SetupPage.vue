<script setup lang="ts">
import { ref } from 'vue'
import CategorySetup from '@/components/setup/CategorySetup.vue'
import MemberSetup from '@/components/setup/MemberSetup.vue'

const activeTab = ref('members')
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
        <CategorySetup />
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
