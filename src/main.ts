import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { loadSvg } from "./utils/index.ts"

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const app = createApp(App)

app.use(ElementPlus, { locale: zhCn })
/** 加载全局 SVG */
loadSvg(app)
app.mount('#app')


//createApp(App).mount('#app')
