import App from './App.vue'
import router from './router'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'boxicons/css/boxicons.min.css';
import './assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import ToastPlugin from 'vue-toast-notification';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'vue-toast-notification/dist/theme-default.css';

const app = createApp(App)
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia)
app.use(ToastPlugin,{
    position: 'top'
});
app.use(router)

app.mount('#app')
