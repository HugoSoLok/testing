import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'
import router from './router'
import App from './App.vue'
import { seedIfEmpty } from './lib/db'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vant)

app.mount('#app')

// Seed default data on first launch (after mount so Dexie can open)
seedIfEmpty().catch(console.error)
