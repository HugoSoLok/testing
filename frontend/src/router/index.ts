import { createRouter, createWebHashHistory } from 'vue-router'
import ExpensePage from '@/pages/ExpensePage.vue'
import SetupPage from '@/pages/SetupPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/expense',
    },
    {
      path: '/expense',
      name: 'expense',
      component: ExpensePage,
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupPage,
    },
  ],
})

export default router
