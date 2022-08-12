import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Router from './router'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(Router) 
app.mount('#app')
