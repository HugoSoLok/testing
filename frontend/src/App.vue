<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const active = ref(route.name === 'setup' ? 'setup' : 'expense')

function onTabChange(name: string | number) {
  router.push({ name: String(name) })
}
</script>

<template>
  <div id="app-shell">
    <main class="app-main">
      <router-view />
    </main>

    <van-tabbar
      v-model="active"
      route
      safe-area-inset-bottom
      @change="onTabChange"
    >
      <van-tabbar-item name="expense" icon="records">
        Expenses
      </van-tabbar-item>
      <van-tabbar-item name="setup" icon="setting-o">
        Setup
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
#app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px; /* Vant tabbar height */
}
</style>
