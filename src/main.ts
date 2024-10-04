import App from './App.vue'
import router from './router'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'boxicons/css/boxicons.min.css';
import './index.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
